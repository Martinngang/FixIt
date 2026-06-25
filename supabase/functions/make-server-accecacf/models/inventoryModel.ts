import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.ts'
import * as notificationModel from './notificationModel.ts'
import * as organizationModel from './organizationModel.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export const REORDER_STATUSES = ['pending', 'ordered', 'received', 'cancelled'] as const

// ---- Inventory items ----

export async function getAllItems(organizationId: string | null, { category }: { category?: string } = {}) {
  let items = await kv.getByPrefix('inventory:')

  items = items.filter((item) => (item.organizationId ?? null) === organizationId)

  if (category) items = items.filter((item) => item.category === category)

  return items.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getItem(itemId: string, organizationId: string | null) {
  const item = await kv.get(`inventory:${itemId}`)
  if (!item || (item.organizationId ?? null) !== organizationId) return null
  return item
}

export async function createItem(organizationId: string | null, {
  name,
  category,
  sku,
  unit,
  quantityOnHand,
  reorderThreshold,
  reorderQuantity,
  supplier,
}: {
  name: string
  category?: string
  sku?: string
  unit?: string
  quantityOnHand?: number
  reorderThreshold?: number
  reorderQuantity?: number
  supplier?: string
}) {
  const trimmedName = (name || '').trim()
  if (!trimmedName) throw new ValidationError('Name is required')

  const validCategories = await organizationModel.getCategoriesForTenant(organizationId)
  if (category && !validCategories.includes(category)) {
    throw new ValidationError(`category must be one of: ${validCategories.join(', ')}`)
  }

  const item = {
    id: crypto.randomUUID(),
    organizationId,
    name: trimmedName,
    category: category || 'Other',
    sku: (sku || '').trim() || null,
    unit: (unit || '').trim() || 'unit',
    quantityOnHand: Math.max(0, Number(quantityOnHand) || 0),
    reorderThreshold: Math.max(0, Number(reorderThreshold) || 0),
    reorderQuantity: Math.max(0, Number(reorderQuantity) || 0),
    supplier: (supplier || '').trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`inventory:${item.id}`, item)

  if (item.quantityOnHand <= item.reorderThreshold) {
    await ensureReorderRequest(item, 'system')
  }

  return item
}

export async function updateItem(itemId: string, organizationId: string | null, updates: {
  name?: string
  category?: string
  sku?: string
  unit?: string
  reorderThreshold?: number
  reorderQuantity?: number
  supplier?: string
}) {
  const item = await kv.get(`inventory:${itemId}`)
  if (!item || (item.organizationId ?? null) !== organizationId) throw new NotFoundError('Inventory item not found')

  if (updates.category) {
    const validCategories = await organizationModel.getCategoriesForTenant(item.organizationId ?? null)
    if (!validCategories.includes(updates.category)) {
      throw new ValidationError(`category must be one of: ${validCategories.join(', ')}`)
    }
  }

  const updatedItem = {
    ...item,
    ...(updates.name !== undefined ? { name: updates.name.trim() || item.name } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.sku !== undefined ? { sku: updates.sku.trim() || null } : {}),
    ...(updates.unit !== undefined ? { unit: updates.unit.trim() || 'unit' } : {}),
    ...(updates.reorderThreshold !== undefined ? { reorderThreshold: Math.max(0, Number(updates.reorderThreshold) || 0) } : {}),
    ...(updates.reorderQuantity !== undefined ? { reorderQuantity: Math.max(0, Number(updates.reorderQuantity) || 0) } : {}),
    ...(updates.supplier !== undefined ? { supplier: updates.supplier.trim() || null } : {}),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`inventory:${itemId}`, updatedItem)

  if (updatedItem.quantityOnHand <= updatedItem.reorderThreshold) {
    await ensureReorderRequest(updatedItem, 'system')
  }

  return updatedItem
}

export async function deleteItem(itemId: string, organizationId: string | null) {
  const item = await kv.get(`inventory:${itemId}`)
  if (!item || (item.organizationId ?? null) !== organizationId) throw new NotFoundError('Inventory item not found')

  await kv.del(`inventory:${itemId}`)
}

// ---- Stock adjustments ----

export async function adjustStock(itemId: string, organizationId: string | null, delta: number, { relatedIssueId, userId }: {
  relatedIssueId?: string
  userId?: string
} = {}) {
  const item = await kv.get(`inventory:${itemId}`)
  if (!item || (item.organizationId ?? null) !== organizationId) throw new NotFoundError('Inventory item not found')

  const updatedItem = {
    ...item,
    quantityOnHand: Math.max(0, item.quantityOnHand + delta),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`inventory:${itemId}`, updatedItem)

  if (updatedItem.quantityOnHand <= updatedItem.reorderThreshold) {
    await ensureReorderRequest(updatedItem, userId || 'system', relatedIssueId)
  }

  return updatedItem
}

// ---- Reorder requests ----

// Sends a notification to every admin user. sendNotification() supports
// 'all'/'technicians'/'citizens' recipient groups but not 'admins', so
// supply-chain alerts (reorders, parts shortages) need this instead.
async function notifyAdmins({ title, message, type, relatedIssueId, senderId, senderName, organizationId }: {
  title: string
  message: string
  type: string
  relatedIssueId?: string
  senderId: string
  senderName: string
  organizationId: string | null
}) {
  const { data: authUsers, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error

  const admins = (authUsers?.users || []).filter(
    (u) => u.user_metadata?.role === 'admin' && (u.user_metadata?.organizationId ?? null) === organizationId
  )

  for (const admin of admins) {
    await notificationModel.createNotification({
      recipientId: admin.id,
      title,
      message,
      type,
      relatedIssueId: relatedIssueId || null,
      senderId,
      senderName,
    })
  }
}

// Creates a 'pending' reorder request for an item that has dropped to or
// below its reorder threshold, unless one is already pending/ordered.
async function ensureReorderRequest(item: any, triggeredBy: string, relatedIssueId?: string) {
  const existingReorders = await kv.getByPrefix('reorder:')
  const hasOpenReorder = existingReorders.some(
    (r) => r.itemId === item.id && (r.status === 'pending' || r.status === 'ordered')
  )
  if (hasOpenReorder) return null

  const reorder = {
    id: crypto.randomUUID(),
    organizationId: item.organizationId ?? null,
    itemId: item.id,
    itemName: item.name,
    quantityRequested: item.reorderQuantity || item.reorderThreshold || 1,
    supplier: item.supplier || null,
    status: 'pending' as typeof REORDER_STATUSES[number],
    triggeredBy,
    relatedIssueId: relatedIssueId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`reorder:${reorder.id}`, reorder)

  await notifyAdmins({
    title: 'Reorder Needed',
    message: `Stock for "${item.name}" is at or below the reorder threshold (${item.quantityOnHand}/${item.reorderThreshold} ${item.unit}). A reorder request for ${reorder.quantityRequested} ${item.unit} has been created.`,
    type: 'reorder_needed',
    relatedIssueId,
    senderId: 'system',
    senderName: 'FixIt System',
    organizationId: item.organizationId ?? null,
  })

  return reorder
}

export async function getAllReorders(organizationId: string | null, { status }: { status?: string } = {}) {
  let reorders = await kv.getByPrefix('reorder:')

  reorders = reorders.filter((r) => (r.organizationId ?? null) === organizationId)

  if (status) reorders = reorders.filter((r) => r.status === status)

  return reorders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function updateReorderStatus(reorderId: string, organizationId: string | null, status: string) {
  if (!REORDER_STATUSES.includes(status as typeof REORDER_STATUSES[number])) {
    throw new ValidationError(`status must be one of: ${REORDER_STATUSES.join(', ')}`)
  }

  const reorder = await kv.get(`reorder:${reorderId}`)
  if (!reorder || (reorder.organizationId ?? null) !== organizationId) throw new NotFoundError('Reorder request not found')

  const updatedReorder = { ...reorder, status, updatedAt: new Date().toISOString() }
  await kv.set(`reorder:${reorderId}`, updatedReorder)

  // Marking a reorder 'received' restocks the item by the requested quantity.
  if (status === 'received' && reorder.status !== 'received') {
    await adjustStock(reorder.itemId, organizationId, reorder.quantityRequested, { relatedIssueId: reorder.relatedIssueId })
  }

  return updatedReorder
}

// ---- Requesting parts for an issue ----

export const REQUIRED_PART_STATUSES = ['fulfilled', 'shortage'] as const

export async function requestPartsForIssue(issueId: string, itemId: string, quantity: number, userId: string, userName: string, organizationId: string | null) {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new ValidationError('quantity must be a positive number')

  const issue = await kv.get(`issue:${issueId}`)
  if (!issue || (issue.organizationId ?? null) !== organizationId) throw new NotFoundError('Issue not found')
  if (issue.assignedTo !== userId) throw new ForbiddenError('Not assigned to this issue')

  const item = await kv.get(`inventory:${itemId}`)
  if (!item || (item.organizationId ?? null) !== organizationId) throw new NotFoundError('Inventory item not found')

  const fulfilledQuantity = Math.min(quantity, item.quantityOnHand)
  const shortfall = quantity - fulfilledQuantity

  const updatedItem = {
    ...item,
    quantityOnHand: item.quantityOnHand - fulfilledQuantity,
    updatedAt: new Date().toISOString(),
  }
  await kv.set(`inventory:${itemId}`, updatedItem)

  const requiredPart = {
    id: crypto.randomUUID(),
    itemId,
    itemName: item.name,
    unit: item.unit,
    quantityRequested: quantity,
    quantityFulfilled: fulfilledQuantity,
    status: (shortfall > 0 ? 'shortage' : 'fulfilled') as typeof REQUIRED_PART_STATUSES[number],
    requestedAt: new Date().toISOString(),
  }

  const requiredParts = [...(issue.requiredParts || []), requiredPart]
  const updatedIssue = { ...issue, requiredParts, updatedAt: new Date().toISOString() }
  await kv.set(`issue:${issueId}`, updatedIssue)

  if (updatedItem.quantityOnHand <= updatedItem.reorderThreshold) {
    await ensureReorderRequest(updatedItem, userId, issueId)
  }

  if (shortfall > 0) {
    await notifyAdmins({
      title: 'Parts Shortage',
      message: `${userName} needs ${shortfall} more ${item.unit} of "${item.name}" to complete issue "${issue.title}" — only ${fulfilledQuantity} of ${quantity} available.`,
      type: 'parts_shortage',
      relatedIssueId: issueId,
      senderId: userId,
      senderName: userName,
      organizationId,
    })
  }

  return { issue: updatedIssue, item: updatedItem, requiredPart }
}

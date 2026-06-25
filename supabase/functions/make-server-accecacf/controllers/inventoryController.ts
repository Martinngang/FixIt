import type { AppContext } from '../utils/types.ts'
import * as inventoryModel from '../models/inventoryModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser, getOrganizationId } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

function requireStaff(userRole: string) {
  if (userRole !== 'admin' && userRole !== 'technician') throw new ForbiddenError('Staff access required')
}

function requireAdmin(userRole: string) {
  if (userRole !== 'admin') throw new ForbiddenError('Admin access required')
}

export async function getAllItems(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const category = c.req.query('category')
    const items = await inventoryModel.getAllItems(getOrganizationId(user), { category })

    return c.json({ items })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch inventory items')
  }
}

export async function getItem(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const itemId = c.req.param('id')
    const item = await inventoryModel.getItem(itemId, getOrganizationId(user))
    if (!item) throw new NotFoundError('Inventory item not found')

    return c.json({ item })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch inventory item')
  }
}

export async function createItem(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireAdmin(getEffectiveUserRole(user, c.req))

    const { name, category, sku, unit, quantityOnHand, reorderThreshold, reorderQuantity, supplier } = await c.req.json()

    const item = await inventoryModel.createItem(getOrganizationId(user), { name, category, sku, unit, quantityOnHand, reorderThreshold, reorderQuantity, supplier })

    return c.json({ success: true, item })
  } catch (error) {
    return handleError(c, error, 'Failed to create inventory item')
  }
}

export async function updateItem(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireAdmin(getEffectiveUserRole(user, c.req))

    const itemId = c.req.param('id')
    const updates = await c.req.json()

    const item = await inventoryModel.updateItem(itemId, getOrganizationId(user), updates)

    return c.json({ success: true, item })
  } catch (error) {
    return handleError(c, error, 'Failed to update inventory item')
  }
}

export async function deleteItem(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireAdmin(getEffectiveUserRole(user, c.req))

    const itemId = c.req.param('id')
    await inventoryModel.deleteItem(itemId, getOrganizationId(user))

    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete inventory item')
  }
}

export async function adjustStock(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const itemId = c.req.param('id')
    const { delta } = await c.req.json()

    if (typeof delta !== 'number' || !Number.isFinite(delta)) throw new ValidationError('delta must be a number')

    const item = await inventoryModel.adjustStock(itemId, getOrganizationId(user), delta, { userId: user.id })

    return c.json({ success: true, item })
  } catch (error) {
    return handleError(c, error, 'Failed to adjust stock')
  }
}

export async function getAllReorders(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireAdmin(getEffectiveUserRole(user, c.req))

    const status = c.req.query('status')
    const reorders = await inventoryModel.getAllReorders(getOrganizationId(user), { status })

    return c.json({ reorders })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch reorder requests')
  }
}

export async function updateReorderStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireAdmin(getEffectiveUserRole(user, c.req))

    const reorderId = c.req.param('id')
    const { status } = await c.req.json()

    if (!status) throw new ValidationError('status is required')

    const reorder = await inventoryModel.updateReorderStatus(reorderId, getOrganizationId(user), status)

    return c.json({ success: true, reorder })
  } catch (error) {
    return handleError(c, error, 'Failed to update reorder status')
  }
}

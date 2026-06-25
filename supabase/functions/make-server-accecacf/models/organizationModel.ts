import * as kv from '../kv_store.tsx'
import { NotFoundError, ValidationError } from '../utils/errors.ts'
import { ISSUE_CATEGORIES } from '../utils/gemini.ts'

export const ORGANIZATION_TYPES = ['university', 'corporate', 'residential', 'mall', 'other'] as const

export interface Organization {
  id: string
  name: string
  type: string
  categories: string[]
  locationLabel: string
  joinCode: string
  createdBy: string
  createdAt: string
  updatedAt: string
  planId: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'past_due' | 'canceled'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodEnd?: string
}

const DEFAULT_CATEGORIES = [
  'Maintenance Request',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Cleaning',
  'Security',
  'IT & Network',
  'Other',
]

const DEFAULT_LOCATION_LABEL = 'Building / Room / Asset ID'

function generateJoinCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  return (await kv.get(`organization:${organizationId}`)) ?? null
}

export async function getOrganizationByJoinCode(joinCode: string): Promise<Organization | null> {
  const organizationId = await kv.get(`org_join_code:${joinCode.toUpperCase()}`)
  if (!organizationId) return null
  return getOrganization(organizationId)
}

export async function createOrganization({ name, type, createdBy }: {
  name: string
  type?: string
  createdBy: string
}): Promise<Organization> {
  const trimmedName = (name || '').trim()
  if (!trimmedName) throw new ValidationError('Organization name is required')

  const id = crypto.randomUUID()
  const joinCode = generateJoinCode()
  const now = new Date().toISOString()

  const organization: Organization = {
    id,
    name: trimmedName,
    type: type && ORGANIZATION_TYPES.includes(type as typeof ORGANIZATION_TYPES[number]) ? type : 'other',
    categories: [...DEFAULT_CATEGORIES],
    locationLabel: DEFAULT_LOCATION_LABEL,
    joinCode,
    createdBy,
    createdAt: now,
    updatedAt: now,
    // New orgs start on the free plan - it never touches Stripe, so there's
    // nothing to provision here. See billingModel.ts for upgrade flow.
    planId: 'free',
    subscriptionStatus: 'active',
  }

  await kv.set(`organization:${id}`, organization)
  await kv.set(`org_join_code:${joinCode}`, id)

  return organization
}

export async function updateOrganization(organizationId: string, updates: {
  name?: string
  categories?: string[]
  locationLabel?: string
}): Promise<Organization> {
  const organization = await getOrganization(organizationId)
  if (!organization) throw new NotFoundError('Organization not found')

  if (updates.name !== undefined && !updates.name.trim()) {
    throw new ValidationError('Organization name cannot be empty')
  }

  let categories = organization.categories
  if (updates.categories !== undefined) {
    categories = updates.categories.map((c) => (c || '').trim()).filter(Boolean)
    if (categories.length === 0) throw new ValidationError('At least one category is required')
  }

  const updatedOrganization: Organization = {
    ...organization,
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    categories,
    ...(updates.locationLabel !== undefined
      ? { locationLabel: updates.locationLabel.trim() || DEFAULT_LOCATION_LABEL }
      : {}),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`organization:${organizationId}`, updatedOrganization)
  return updatedOrganization
}

// The single place that persists billing-field changes, so the
// `organization:${id}` KV record stays owned by this file even though the
// Stripe API calls themselves live in billingModel.ts.
export async function updateBilling(organizationId: string, fields: Partial<Pick<Organization,
  'planId' | 'subscriptionStatus' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'currentPeriodEnd'
>>): Promise<Organization> {
  const organization = await getOrganization(organizationId)
  if (!organization) throw new NotFoundError('Organization not found')

  const updatedOrganization: Organization = {
    ...organization,
    ...fields,
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`organization:${organizationId}`, updatedOrganization)
  return updatedOrganization
}

export async function regenerateJoinCode(organizationId: string): Promise<Organization> {
  const organization = await getOrganization(organizationId)
  if (!organization) throw new NotFoundError('Organization not found')

  await kv.del(`org_join_code:${organization.joinCode}`)

  const joinCode = generateJoinCode()
  const updatedOrganization: Organization = { ...organization, joinCode, updatedAt: new Date().toISOString() }

  await kv.set(`organization:${organizationId}`, updatedOrganization)
  await kv.set(`org_join_code:${joinCode}`, organizationId)

  return updatedOrganization
}

// Returns the issue/inventory categories valid for the given tenant - an
// organization's own custom categories for org tenants, or the global city
// categories for the public (null) tenant.
export async function getCategoriesForTenant(organizationId: string | null): Promise<string[]> {
  if (!organizationId) return [...ISSUE_CATEGORIES]
  const organization = await getOrganization(organizationId)
  return organization?.categories?.length ? organization.categories : [...ISSUE_CATEGORIES]
}

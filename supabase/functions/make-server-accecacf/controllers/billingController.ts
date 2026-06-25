import type { AppContext } from '../utils/types.ts'
import * as organizationModel from '../models/organizationModel.ts'
import * as billingModel from '../models/billingModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser, getOrganizationId } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

async function requireOrgAdmin(c: AppContext) {
  const user = await getAuthenticatedUser(c)
  const organizationId = getOrganizationId(user)
  if (!organizationId || getEffectiveUserRole(user, c.req) !== 'admin') {
    throw new ForbiddenError('Organization admin access required')
  }

  const organization = await organizationModel.getOrganization(organizationId)
  if (!organization) throw new NotFoundError('Organization not found')

  return organization
}

export async function getBillingInfo(c: AppContext) {
  try {
    const organization = await requireOrgAdmin(c)
    const billing = await billingModel.getBillingInfo(organization)
    return c.json({ billing })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch billing info')
  }
}

export async function startSubscriptionCheckout(c: AppContext) {
  try {
    const organization = await requireOrgAdmin(c)
    const { planId } = await c.req.json()

    const result = await billingModel.createSubscriptionCheckout(organization, planId)
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to start subscription checkout')
  }
}

export async function openBillingPortal(c: AppContext) {
  try {
    const organization = await requireOrgAdmin(c)
    const result = await billingModel.createBillingPortalSession(organization)
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to open billing portal')
  }
}

export async function handleBillingWebhook(c: AppContext) {
  try {
    const signature = c.req.header('stripe-signature')
    if (!signature) throw new ValidationError('Missing Stripe signature')

    const rawBody = await c.req.text()
    await billingModel.handleBillingWebhookEvent(rawBody, signature)

    return c.json({ received: true })
  } catch (error) {
    return handleError(c, error, 'Webhook processing failed')
  }
}

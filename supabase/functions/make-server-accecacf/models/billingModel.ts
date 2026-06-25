import * as organizationModel from './organizationModel.ts'
import * as userModel from './userModel.ts'
import type { Organization } from './organizationModel.ts'
import { requireStripe, FRONTEND_URL } from '../utils/stripe.ts'
import { ConflictError, ForbiddenError, ValidationError } from '../utils/errors.ts'
import { logger } from '../utils/logger.ts'

// Seat limits and Stripe Price IDs for each org plan tier. Seat numbers are
// adjustable constants, not a hard product requirement. priceId is null for
// 'free' since it never creates a Stripe subscription.
export const ORG_PLANS: Record<string, { seatLimit: number; priceId: string | null }> = {
  free: { seatLimit: 3, priceId: null },
  pro: { seatLimit: 25, priceId: Deno.env.get('STRIPE_PRICE_ORG_PRO') || null },
  enterprise: { seatLimit: Infinity, priceId: Deno.env.get('STRIPE_PRICE_ORG_ENTERPRISE') || null },
}

function getPlan(planId: string) {
  return ORG_PLANS[planId] || ORG_PLANS.free
}

// A "seat" is any member of the org (citizen, technician, or admin) -
// everyone inside a private tenant counts, since the org pays for the
// instance regardless of role.
export async function getSeatUsage(organizationId: string) {
  const members = await userModel.listUsers(organizationId)
  return members.length
}

export async function assertSeatAvailable(organization: Organization) {
  const plan = getPlan(organization.planId)
  const seatCount = await getSeatUsage(organization.id)
  if (seatCount >= plan.seatLimit) {
    throw new ForbiddenError(
      `This organization's ${organization.planId} plan is at its ${plan.seatLimit}-member limit. Ask an admin to upgrade.`
    )
  }
}

export async function getBillingInfo(organization: Organization) {
  const plan = getPlan(organization.planId)
  const seatCount = await getSeatUsage(organization.id)

  return {
    planId: organization.planId,
    subscriptionStatus: organization.subscriptionStatus,
    currentPeriodEnd: organization.currentPeriodEnd ?? null,
    seatsUsed: seatCount,
    seatLimit: plan.seatLimit === Infinity ? null : plan.seatLimit,
    hasBillingAccount: !!organization.stripeCustomerId,
  }
}

// Starts a Stripe Checkout session in subscription mode for the org to
// upgrade to a paid plan. Reuses the org's existing Stripe customer if one
// was already created by a previous checkout; otherwise lets Checkout
// create one (we capture it from the completed-session webhook).
export async function createSubscriptionCheckout(organization: Organization, planId: string) {
  if (planId !== 'pro' && planId !== 'enterprise') {
    throw new ValidationError("planId must be 'pro' or 'enterprise'")
  }

  const plan = getPlan(planId)
  if (!plan.priceId) {
    throw new ConflictError(`No Stripe price configured for the ${planId} plan`)
  }

  const { stripe } = requireStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(organization.stripeCustomerId ? { customer: organization.stripeCustomerId } : {}),
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${FRONTEND_URL}/admin?billing=success`,
    cancel_url: `${FRONTEND_URL}/admin?billing=cancelled`,
    metadata: { organizationId: organization.id, planId },
    subscription_data: { metadata: { organizationId: organization.id, planId } },
  })

  return { checkoutUrl: session.url }
}

// Stripe-hosted portal for the org admin to update payment method, view
// invoices, or cancel - standard Stripe Billing feature, no custom UI needed.
export async function createBillingPortalSession(organization: Organization) {
  if (!organization.stripeCustomerId) {
    throw new ConflictError('This organization has no billing account yet - upgrade to a paid plan first')
  }

  const { stripe } = requireStripe()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `${FRONTEND_URL}/admin`,
  })

  return { portalUrl: portalSession.url }
}

export async function handleBillingWebhookEvent(rawBody: string, signature: string) {
  const { stripe, stripeCryptoProvider } = requireStripe()
  const webhookSecret = Deno.env.get('STRIPE_BILLING_WEBHOOK_SECRET') || ''
  const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret, undefined, stripeCryptoProvider)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const organizationId = session.metadata?.organizationId
    const planId = session.metadata?.planId
    if (!organizationId || !planId) return

    await organizationModel.updateBilling(organizationId, {
      planId,
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
    })
    return
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any
    const organizationId = subscription.metadata?.organizationId
    if (!organizationId) return

    const status = subscription.status === 'active' ? 'active'
      : subscription.status === 'past_due' ? 'past_due'
      : 'canceled'

    await organizationModel.updateBilling(organizationId, {
      subscriptionStatus: status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined,
    })
    return
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const organizationId = subscription.metadata?.organizationId
    if (!organizationId) return

    logger.info('Organization subscription cancelled - reverting to free plan', { organizationId })
    await organizationModel.updateBilling(organizationId, {
      planId: 'free',
      subscriptionStatus: 'active',
      stripeSubscriptionId: undefined,
    })
  }
}

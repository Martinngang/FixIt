import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import * as userModel from './userModel.ts'
import * as organizationModel from './organizationModel.ts'
import { requireStripe, FRONTEND_URL } from '../utils/stripe.ts'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'
import { logger } from '../utils/logger.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Percentage of a marketplace job's budget that FixIt keeps as a commission,
// snapshotted onto each posting so a future rate change never affects jobs
// already in flight.
export const MARKETPLACE_COMMISSION_RATE = 0.15

export interface MarketplaceInfo {
  status: 'open' | 'claimed' | 'completed' | 'paid'
  budget: number
  commissionRate: number
  postedBy: string
  postedAt: string
  contractorId?: string
  contractorName?: string
  claimedAt?: string
  completedAt?: string
  transactionId?: string
  paidAt?: string
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// --- Contractor vetting -----------------------------------------------

// Only public city tenant users can apply, keeping the marketplace pool
// separate from any private org's own staff - vetted by the city's admins.
export async function applyAsContractor(user: any) {
  if ((user.user_metadata?.organizationId ?? null) !== null) {
    throw new ForbiddenError('Only public city tenant users can apply as independent contractors')
  }

  const currentStatus = user.user_metadata?.marketplaceStatus
  if (currentStatus === 'pending' || currentStatus === 'approved') {
    throw new ConflictError('You have already applied to the marketplace')
  }

  const updatedUser = await userModel.updateUser(user.id, {
    user_metadata: {
      ...user.user_metadata,
      marketplaceStatus: 'pending',
      role: user.user_metadata?.role === 'citizen' ? 'technician' : user.user_metadata?.role,
    },
  })

  return updatedUser
}

export async function listContractorApplications() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error

  return (data?.users || [])
    .filter((authUser) => !!authUser.user_metadata?.marketplaceStatus)
    .map((authUser) => ({
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'Unknown',
      categories: authUser.user_metadata?.categories || [],
      marketplaceStatus: authUser.user_metadata?.marketplaceStatus,
      stripeOnboardingComplete: !!authUser.user_metadata?.stripeOnboardingComplete,
    }))
}

export async function setContractorStatus(userId: string, status: 'approved' | 'rejected') {
  const targetUser = await userModel.getUserById(userId)
  if (!targetUser || !targetUser.user_metadata?.marketplaceStatus) {
    throw new NotFoundError('Contractor application not found')
  }

  return await userModel.updateUser(userId, {
    user_metadata: { ...targetUser.user_metadata, marketplaceStatus: status },
  })
}

// --- Job posting & claiming ---------------------------------------------

export async function postToMarketplace(issue: any, budget: number, postedBy: string) {
  if (issue.assignedTo) throw new ConflictError('Issue is already assigned and cannot be posted to the marketplace')
  if (issue.marketplace) throw new ConflictError('Issue is already posted to the marketplace')
  if (issue.status === 'resolved' || issue.status === 'rejected') {
    throw new ConflictError('Resolved or rejected issues cannot be posted to the marketplace')
  }
  if (!budget || budget <= 0) throw new ValidationError('budget must be a positive number')

  const marketplace: MarketplaceInfo = {
    status: 'open',
    budget,
    commissionRate: MARKETPLACE_COMMISSION_RATE,
    postedBy,
    postedAt: new Date().toISOString(),
  }

  const updatedIssue = { ...issue, marketplace, updatedAt: new Date().toISOString() }
  await kv.set(`issue:${issue.id}`, updatedIssue)
  return updatedIssue
}

export async function unpostFromMarketplace(issue: any) {
  if (!issue.marketplace || issue.marketplace.status !== 'open') {
    throw new ConflictError('Only open marketplace postings can be cancelled')
  }

  const { marketplace, ...rest } = issue
  const updatedIssue = { ...rest, updatedAt: new Date().toISOString() }
  await kv.set(`issue:${issue.id}`, updatedIssue)
  return updatedIssue
}

// Cross-tenant by design: any approved contractor can browse jobs posted by
// any tenant. Returns a sanitized shape - no reporter identity or raw
// organizationId, just enough context for a contractor to decide.
export async function getOpenJobs() {
  const issues = await kv.getByPrefix('issue:')
  const openJobs = issues.filter((issue) => issue.marketplace?.status === 'open')

  const orgNameCache = new Map<string, string>()

  const jobs = await Promise.all(
    openJobs.map(async (issue) => {
      const organizationId = issue.organizationId ?? null
      let organizationName = 'Public City'

      if (organizationId) {
        if (!orgNameCache.has(organizationId)) {
          const organization = await organizationModel.getOrganization(organizationId)
          orgNameCache.set(organizationId, organization?.name || 'Private Organization')
        }
        organizationName = orgNameCache.get(organizationId)!
      }

      const commissionAmount = round2(issue.marketplace.budget * issue.marketplace.commissionRate)

      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        location: issue.location,
        priority: issue.priority,
        budget: issue.marketplace.budget,
        commissionRate: issue.marketplace.commissionRate,
        contractorPayout: round2(issue.marketplace.budget - commissionAmount),
        postedAt: issue.marketplace.postedAt,
        organizationName,
      }
    })
  )

  return jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
}

// The cross-tenant exception: a marketplace contractor claims a job that may
// belong to a different tenant than their own. assertIssueAccess in
// issueController.ts grants this contractor read/update access to this one
// issue afterwards - nothing broader.
export async function claimJob(issue: any, contractor: any) {
  if (!issue.marketplace || issue.marketplace.status !== 'open') {
    throw new ConflictError('This job is no longer open')
  }
  if (contractor.user_metadata?.marketplaceStatus !== 'approved') {
    throw new ForbiddenError('Approved contractor status required')
  }
  if (!contractor.user_metadata?.stripeOnboardingComplete) {
    throw new ForbiddenError('Complete Stripe onboarding before claiming marketplace jobs')
  }

  const now = new Date().toISOString()
  const updatedIssue = {
    ...issue,
    assignedTo: contractor.id,
    assignedBy: contractor.id,
    assignedAt: now,
    status: 'assigned',
    marketplace: {
      ...issue.marketplace,
      status: 'claimed',
      contractorId: contractor.id,
      contractorName: contractor.user_metadata?.name || contractor.email,
      claimedAt: now,
    },
    updatedAt: now,
  }

  await kv.set(`issue:${issue.id}`, updatedIssue)
  return updatedIssue
}

// A contractor's own claimed/completed/paid jobs, regardless of which
// tenant posted them.
export async function getMyMarketplaceJobs(contractorId: string) {
  const issues = await kv.getByPrefix('issue:')
  return issues
    .filter((issue) => issue.marketplace?.contractorId === contractorId)
    .sort((a, b) =>
      new Date(b.marketplace.claimedAt || b.updatedAt).getTime() -
      new Date(a.marketplace.claimedAt || a.updatedAt).getTime()
    )
}

// --- Stripe Connect onboarding -------------------------------------------

export async function onboardContractor(user: any) {
  if (user.user_metadata?.marketplaceStatus !== 'approved') {
    throw new ForbiddenError('Approved contractor status required')
  }

  const { stripe } = requireStripe()
  let accountId = user.user_metadata?.stripeAccountId

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: { transfers: { requested: true } },
    })
    accountId = account.id

    await userModel.updateUser(user.id, {
      user_metadata: { ...user.user_metadata, stripeAccountId: accountId },
    })
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${FRONTEND_URL}/marketplace?stripe=refresh`,
    return_url: `${FRONTEND_URL}/marketplace?stripe=return`,
    type: 'account_onboarding',
  })

  return { url: accountLink.url }
}

export async function getContractorStripeStatus(user: any) {
  const accountId = user.user_metadata?.stripeAccountId
  if (!accountId) return { connected: false, onboardingComplete: false }

  const { stripe } = requireStripe()
  const account = await stripe.accounts.retrieve(accountId)
  const onboardingComplete = !!(account.details_submitted && account.charges_enabled)

  if (onboardingComplete !== !!user.user_metadata?.stripeOnboardingComplete) {
    await userModel.updateUser(user.id, {
      user_metadata: { ...user.user_metadata, stripeOnboardingComplete: onboardingComplete },
    })
  }

  return { connected: true, onboardingComplete }
}

// --- Payment & commission -------------------------------------------------

// Splits the job's budget via a Stripe Connect destination charge: the
// posting tenant pays `budget`, FixIt keeps `commissionAmount` as an
// application fee, and the rest is transferred to the contractor's
// connected account.
export async function createCheckoutForJob(issue: any, initiatedBy: string) {
  if (!issue.marketplace || issue.marketplace.status !== 'completed') {
    throw new ConflictError('This job is not ready for payment')
  }

  const contractor = await userModel.getUserById(issue.marketplace.contractorId)
  if (!contractor?.user_metadata?.stripeAccountId) {
    throw new ConflictError('Contractor has not completed Stripe onboarding')
  }

  const { budget, commissionRate } = issue.marketplace
  const commissionAmount = round2(budget * commissionRate)
  const contractorPayout = round2(budget - commissionAmount)

  const transactionId = crypto.randomUUID()

  const { stripe } = requireStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `FixIt Marketplace Job: ${issue.title}` },
        unit_amount: Math.round(budget * 100),
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: Math.round(commissionAmount * 100),
      transfer_data: { destination: contractor.user_metadata.stripeAccountId },
    },
    success_url: `${FRONTEND_URL}/admin?marketplacePayment=success&issueId=${issue.id}`,
    cancel_url: `${FRONTEND_URL}/admin?marketplacePayment=cancelled&issueId=${issue.id}`,
    metadata: { transactionId, issueId: issue.id },
  })

  const transaction = {
    id: transactionId,
    issueId: issue.id,
    issueTitle: issue.title,
    organizationId: issue.organizationId ?? null,
    contractorId: issue.marketplace.contractorId,
    budget,
    commissionRate,
    commissionAmount,
    contractorPayout,
    status: 'pending' as const,
    stripeCheckoutSessionId: session.id,
    initiatedBy,
    createdAt: new Date().toISOString(),
  }

  await kv.set(`marketplace_transaction:${transactionId}`, transaction)
  await kv.set(`marketplace_tx_session:${session.id}`, transactionId)

  const updatedIssue = {
    ...issue,
    marketplace: { ...issue.marketplace, transactionId },
    updatedAt: new Date().toISOString(),
  }
  await kv.set(`issue:${issue.id}`, updatedIssue)

  return { checkoutUrl: session.url }
}

// Marks a transaction paid from a Stripe Checkout Session, after verifying
// the amount actually charged matches what we expect - the one check that
// stands between "Stripe says this session completed" and "we trust it
// enough to tell the contractor they were paid". Shared by the webhook and
// by syncPaymentStatus, so both paths apply exactly the same rules.
async function finalizeCheckoutSession(session: any) {
  const transactionId = await kv.get(`marketplace_tx_session:${session.id}`)
  if (!transactionId) return

  const transaction = await kv.get(`marketplace_transaction:${transactionId}`)
  if (!transaction || transaction.status === 'paid') return

  const now = new Date().toISOString()
  const expectedAmount = Math.round(transaction.budget * 100)

  if (session.amount_total !== expectedAmount) {
    logger.error('Marketplace checkout amount mismatch - refusing to mark paid', {
      transactionId,
      expectedAmount,
      actualAmount: session.amount_total,
      stripeSessionId: session.id,
    })
    await kv.set(`marketplace_transaction:${transactionId}`, {
      ...transaction,
      status: 'amount_mismatch',
      updatedAt: now,
    })
    return
  }

  await kv.set(`marketplace_transaction:${transactionId}`, {
    ...transaction,
    status: 'paid',
    stripePaymentIntentId: session.payment_intent,
    paidAt: now,
  })

  const issue = await kv.get(`issue:${transaction.issueId}`)
  if (issue) {
    await kv.set(`issue:${transaction.issueId}`, {
      ...issue,
      marketplace: { ...issue.marketplace, status: 'paid', paidAt: now },
      updatedAt: now,
    })
  }
}

// An abandoned or timed-out Checkout session - let the transaction record
// it so the admin's "Pay Contractor" button knows to start a fresh session
// rather than showing a payment stuck pending forever.
async function expireCheckoutSession(session: any) {
  const transactionId = await kv.get(`marketplace_tx_session:${session.id}`)
  if (!transactionId) return

  const transaction = await kv.get(`marketplace_transaction:${transactionId}`)
  if (!transaction || transaction.status === 'paid') return

  await kv.set(`marketplace_transaction:${transactionId}`, {
    ...transaction,
    status: 'expired',
    updatedAt: new Date().toISOString(),
  })
}

export async function handleStripeWebhookEvent(rawBody: string, signature: string) {
  const { stripe, stripeCryptoProvider } = requireStripe()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
  const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret, undefined, stripeCryptoProvider)

  if (event.type === 'checkout.session.completed') {
    await finalizeCheckoutSession(event.data.object as any)
  } else if (event.type === 'checkout.session.expired') {
    await expireCheckoutSession(event.data.object as any)
  }
}

// Manual reconciliation for when a webhook was missed (delivery failure,
// local dev without a tunnel, etc.) - re-fetches the Checkout Session
// directly from Stripe and applies the same finalize/expire logic the
// webhook would have applied.
export async function syncPaymentStatus(issue: any) {
  const transactionId = issue.marketplace?.transactionId
  if (!transactionId) throw new ConflictError('This job has no pending payment to sync')

  const transaction = await kv.get(`marketplace_transaction:${transactionId}`)
  if (!transaction) throw new NotFoundError('Transaction not found')

  if (transaction.status === 'paid' || transaction.status === 'amount_mismatch') {
    return { status: transaction.status }
  }

  const { stripe } = requireStripe()
  const session = await stripe.checkout.sessions.retrieve(transaction.stripeCheckoutSessionId)

  if (session.status === 'complete' && session.payment_status === 'paid') {
    await finalizeCheckoutSession(session)
  } else if (session.status === 'expired') {
    await expireCheckoutSession(session)
  }

  const refreshed = await kv.get(`marketplace_transaction:${transactionId}`)
  return { status: refreshed?.status ?? transaction.status }
}

// Lets a contractor disconnect Stripe (e.g. to reconnect a different
// account). Clearing stripeOnboardingComplete immediately blocks claiming
// new jobs until they re-onboard; jobs already claimed are unaffected.
export async function disconnectContractorStripe(user: any) {
  if (!user.user_metadata?.stripeAccountId) {
    throw new ConflictError('No connected Stripe account to disconnect')
  }

  const { stripeAccountId, stripeOnboardingComplete, ...restMetadata } = user.user_metadata

  return await userModel.updateUser(user.id, {
    user_metadata: restMetadata,
  })
}

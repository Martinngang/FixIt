import type { AppContext } from '../utils/types.ts'
import * as issueModel from '../models/issueModel.ts'
import * as marketplaceModel from '../models/marketplaceModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser, getOrganizationId } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

function assertTenantOwnsIssue(issue: any, organizationId: string | null) {
  if ((issue.organizationId ?? null) !== organizationId) throw new NotFoundError('Issue not found')
}

// --- Contractor vetting -----------------------------------------------

export async function applyAsContractor(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const updatedUser = await marketplaceModel.applyAsContractor(user)
    return c.json({ success: true, marketplaceStatus: updatedUser.user_metadata?.marketplaceStatus })
  } catch (error) {
    return handleError(c, error, 'Failed to submit contractor application')
  }
}

export async function listContractorApplications(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin' || getOrganizationId(user) !== null) {
      throw new ForbiddenError('City admin access required')
    }

    const applications = await marketplaceModel.listContractorApplications()
    return c.json({ applications })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch contractor applications')
  }
}

export async function setContractorStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin' || getOrganizationId(user) !== null) {
      throw new ForbiddenError('City admin access required')
    }

    const userId = c.req.param('id')
    const { status } = await c.req.json()
    if (status !== 'approved' && status !== 'rejected') {
      throw new ValidationError("status must be 'approved' or 'rejected'")
    }

    const updatedUser = await marketplaceModel.setContractorStatus(userId, status)
    return c.json({ success: true, marketplaceStatus: updatedUser.user_metadata?.marketplaceStatus })
  } catch (error) {
    return handleError(c, error, 'Failed to update contractor status')
  }
}

// --- Stripe Connect onboarding -------------------------------------------

export async function onboardContractor(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const result = await marketplaceModel.onboardContractor(user)
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to start Stripe onboarding')
  }
}

export async function getContractorStripeStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const status = await marketplaceModel.getContractorStripeStatus(user)
    return c.json(status)
  } catch (error) {
    return handleError(c, error, 'Failed to fetch Stripe account status')
  }
}

export async function disconnectContractorStripe(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    await marketplaceModel.disconnectContractorStripe(user)
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to disconnect Stripe account')
  }
}

// --- Job board ----------------------------------------------------------

export async function getOpenJobs(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    if (user.user_metadata?.marketplaceStatus !== 'approved') {
      throw new ForbiddenError('Approved contractor status required')
    }

    const jobs = await marketplaceModel.getOpenJobs()
    return c.json({ jobs })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch marketplace jobs')
  }
}

export async function claimJob(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Job not found')

    const updatedIssue = await marketplaceModel.claimJob(issue, user)
    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to claim job')
  }
}

export async function getMyMarketplaceJobs(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const jobs = await marketplaceModel.getMyMarketplaceJobs(user.id)
    return c.json({ jobs })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch your marketplace jobs')
  }
}

// --- Tenant-side posting & payment ---------------------------------------

export async function postToMarketplace(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertTenantOwnsIssue(issue, getOrganizationId(user))

    const { budget } = await c.req.json()
    const updatedIssue = await marketplaceModel.postToMarketplace(issue, Number(budget), user.id)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to post issue to marketplace')
  }
}

export async function unpostFromMarketplace(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertTenantOwnsIssue(issue, getOrganizationId(user))

    const updatedIssue = await marketplaceModel.unpostFromMarketplace(issue)
    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to cancel marketplace posting')
  }
}

export async function createCheckoutForJob(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertTenantOwnsIssue(issue, getOrganizationId(user))

    const result = await marketplaceModel.createCheckoutForJob(issue, user.id)
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to start payment')
  }
}

// Manual reconciliation button for admins: re-checks the live Stripe status
// of a job's payment in case the webhook was missed.
export async function syncPaymentStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertTenantOwnsIssue(issue, getOrganizationId(user))

    const result = await marketplaceModel.syncPaymentStatus(issue)
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to sync payment status')
  }
}

// --- Stripe webhook -------------------------------------------------------

export async function handleStripeWebhook(c: AppContext) {
  try {
    const signature = c.req.header('stripe-signature')
    if (!signature) throw new ValidationError('Missing Stripe signature')

    const rawBody = await c.req.text()
    await marketplaceModel.handleStripeWebhookEvent(rawBody, signature)

    return c.json({ received: true })
  } catch (error) {
    return handleError(c, error, 'Webhook processing failed')
  }
}

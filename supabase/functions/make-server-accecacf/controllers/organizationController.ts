import type { AppContext } from '../utils/types.ts'
import * as organizationModel from '../models/organizationModel.ts'
import * as userModel from '../models/userModel.ts'
import * as billingModel from '../models/billingModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser, getOrganizationId } from '../utils/auth.ts'
import { handleError, ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

export async function getMyOrganization(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const organizationId = getOrganizationId(user)

    if (!organizationId) return c.json({ organization: null })

    const organization = await organizationModel.getOrganization(organizationId)
    if (!organization) return c.json({ organization: null })

    const isOrgAdmin = getEffectiveUserRole(user, c.req) === 'admin'

    return c.json({
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        categories: organization.categories,
        locationLabel: organization.locationLabel,
        planId: organization.planId,
        subscriptionStatus: organization.subscriptionStatus,
        ...(isOrgAdmin ? { joinCode: organization.joinCode } : {}),
      },
    })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch organization')
  }
}

export async function createOrganization(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    if (getOrganizationId(user)) throw new ConflictError('You are already part of an organization')

    const { name, type } = await c.req.json()
    if (!name) throw new ValidationError('name is required')

    const organization = await organizationModel.createOrganization({ name, type, createdBy: user.id })

    await userModel.updateUser(user.id, {
      user_metadata: {
        ...user.user_metadata,
        organizationId: organization.id,
        role: 'admin',
      },
    })

    return c.json({ success: true, organization })
  } catch (error) {
    return handleError(c, error, 'Failed to create organization')
  }
}

export async function joinOrganization(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    if (getOrganizationId(user)) throw new ConflictError('You are already part of an organization')

    const { joinCode } = await c.req.json()
    if (!joinCode) throw new ValidationError('joinCode is required')

    const organization = await organizationModel.getOrganizationByJoinCode(joinCode)
    if (!organization) throw new NotFoundError('Invalid join code')

    await billingModel.assertSeatAvailable(organization)

    await userModel.updateUser(user.id, {
      user_metadata: {
        ...user.user_metadata,
        organizationId: organization.id,
      },
    })

    return c.json({
      success: true,
      organization: { id: organization.id, name: organization.name, type: organization.type },
    })
  } catch (error) {
    return handleError(c, error, 'Failed to join organization')
  }
}

export async function updateOrganization(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const organizationId = getOrganizationId(user)
    if (!organizationId || getEffectiveUserRole(user, c.req) !== 'admin') {
      throw new ForbiddenError('Organization admin access required')
    }

    const { name, categories, locationLabel } = await c.req.json()
    const organization = await organizationModel.updateOrganization(organizationId, { name, categories, locationLabel })

    return c.json({ success: true, organization })
  } catch (error) {
    return handleError(c, error, 'Failed to update organization')
  }
}

export async function regenerateJoinCode(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const organizationId = getOrganizationId(user)
    if (!organizationId || getEffectiveUserRole(user, c.req) !== 'admin') {
      throw new ForbiddenError('Organization admin access required')
    }

    const organization = await organizationModel.regenerateJoinCode(organizationId)

    return c.json({ success: true, joinCode: organization.joinCode })
  } catch (error) {
    return handleError(c, error, 'Failed to regenerate join code')
  }
}

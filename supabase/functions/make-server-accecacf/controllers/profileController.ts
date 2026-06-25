import type { AppContext } from '../utils/types.ts'
import * as profileModel from '../models/profileModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ValidationError } from '../utils/errors.ts'

export async function getProfile(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const userData = await profileModel.getProfile(user.id, user)
    return c.json({ user: userData })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch profile')
  }
}

export async function updateProfile(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const { name, phone, address, availability, location } = await c.req.json()

    if (availability !== undefined && !['available', 'busy', 'off_duty'].includes(availability)) {
      throw new ValidationError('availability must be one of: available, busy, off_duty')
    }

    if (location !== undefined && location !== null) {
      if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new ValidationError('location must be an object with numeric lat and lng')
      }
    }

    const updatedUser = await profileModel.updateProfile(user.id, user, { name, phone, address, availability, location })
    return c.json({ success: true, user: updatedUser })
  } catch (error) {
    return handleError(c, error, 'Failed to update profile')
  }
}

export async function getLeaderboard(c: AppContext) {
  try {
    const limitParam = c.req.query('limit')
    const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 20, 1), 100) : 20

    const leaderboard = await profileModel.getLeaderboard(limit)
    return c.json({ leaderboard })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch leaderboard')
  }
}

export async function uploadAvatar(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const formData = await c.req.formData()
    const file = formData.get('avatar') as File

    if (!file) throw new ValidationError('No avatar file provided')

    const avatarUrl = await profileModel.uploadAvatar(user.id, file)
    return c.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    return handleError(c, error, 'Internal server error during avatar upload')
  }
}

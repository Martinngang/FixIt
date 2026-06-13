import type { AppContext } from '../utils/types.ts'
import * as userModel from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ForbiddenError, ValidationError } from '../utils/errors.ts'

export async function getUsers(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const users = await userModel.listUsers()
    return c.json({ users })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch users')
  }
}

export async function createUser(c: AppContext) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const { email, password, name, role, categories = [] } = await c.req.json()

    if (!email || !password || !name) {
      throw new ValidationError('email, password, and name are required')
    }

    if (role && !['citizen', 'technician', 'admin'].includes(role)) {
      throw new ValidationError('Invalid role. Must be one of: citizen, technician, admin')
    }

    const newUser = await userModel.createUser({ email, password, name, role, categories })
    return c.json({ success: true, user: newUser })
  } catch (error) {
    return handleError(c, error, 'Failed to create user')
  }
}

export async function updateUser(c: AppContext) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const userId = c.req.param('id')
    const { role, name, email, categories } = await c.req.json()

    const updateData: { email?: string; user_metadata?: any } = {}
    updateData.user_metadata = {}

    if (role) {
      if (!['citizen', 'technician', 'admin'].includes(role)) {
        throw new ValidationError('Invalid role. Must be one of: citizen, technician, admin')
      }
      updateData.user_metadata.role = role
    }

    if (name !== undefined) {
      updateData.user_metadata.name = name
    }

    if (email) {
      updateData.email = email
    }

    if (categories !== undefined) {
      updateData.user_metadata.categories = categories
    }

    const updatedUser = await userModel.updateUser(userId, updateData)
    return c.json({ success: true, user: updatedUser })
  } catch (error) {
    return handleError(c, error, 'Failed to update user')
  }
}

export async function deleteUser(c: AppContext) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const userId = c.req.param('id')

    await userModel.deleteUser(userId)
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete user')
  }
}

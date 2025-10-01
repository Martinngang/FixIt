import { Context } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as userModel from '../models/userModel.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

async function getAuthenticatedUser(c: Context) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
  if (!user?.id) throw new Error('Unauthorized')
  return user
}

export async function getUsers(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') return c.json({ error: 'Admin access required' }, 403)

    const users = await userModel.listUsers()
    return c.json({ users })
  } catch (error) {
    console.log('Get users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
}

export async function createUser(c: Context) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') return c.json({ error: 'Admin access required' }, 403)

    const { email, password, name, role, categories = [] } = await c.req.json()

    const newUser = await userModel.createUser({ email, password, name, role, categories })
    return c.json({ success: true, user: newUser })
  } catch (error) {
    console.log('Create user server error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
}

export async function updateUser(c: Context) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') return c.json({ error: 'Admin access required' }, 403)

    const userId = c.req.param('id')
    const { role, name, email, categories } = await c.req.json()

    const updateData: { email?: string; user_metadata?: any } = {}
    updateData.user_metadata = {}

    if (role) {
      if (!['citizen', 'technician', 'admin'].includes(role)) {
        return c.json({ error: 'Invalid role' }, 400)
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
    console.log('Update user error:', error)
    return c.json({ error: 'Failed to update user' }, 500)
  }
}

export async function deleteUser(c: Context) {
  try {
    const adminUser = await getAuthenticatedUser(c)
    const userRole = userModel.getEffectiveUserRole(adminUser, c.req)
    if (userRole !== 'admin') return c.json({ error: 'Admin access required' }, 403)

    const userId = c.req.param('id')

    await userModel.deleteUser(userId)
    return c.json({ success: true })
  } catch (error) {
    console.log('Delete user error:', error)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
}
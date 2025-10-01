import { Context } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as profileModel from '../models/profileModel.ts'

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

export async function getProfile(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const userData = await profileModel.getProfile(user.id, user)
    return c.json({ user: userData })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
}

export async function updateProfile(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const { name, phone, address } = await c.req.json()

    const updatedUser = await profileModel.updateProfile(user.id, user, { name, phone, address })
    return c.json({ success: true, user: updatedUser })
  } catch (error) {
    console.log('Update profile error:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
}

export async function uploadAvatar(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const formData = await c.req.formData()
    const file = formData.get('avatar') as File

    if (!file) return c.json({ error: 'No avatar file provided' }, 400)

    const avatarUrl = await profileModel.uploadAvatar(user.id, file)
    return c.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.log('Avatar upload server error:', error)
    return c.json({ error: 'Internal server error during avatar upload' }, 500)
  }
}
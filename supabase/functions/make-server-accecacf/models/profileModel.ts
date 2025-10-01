import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function getProfile(userId: string, user: any) {
  const profile = await kv.get(`profile:${userId}`) || {}

  const userData = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || profile.name,
    phone: profile.phone,
    address: profile.address,
    avatarUrl: profile.avatarUrl,
    role: user.user_metadata?.role || 'citizen',
    categories: user.user_metadata?.categories || [],
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at
  }

  return userData
}

export async function updateProfile(userId: string, user: any, updates: { name?: string; phone?: string; address?: string }) {
  // Update user metadata for name
  if (updates.name !== undefined) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        name: updates.name
      }
    })

    if (updateError) throw updateError
  }

  // Store additional profile data
  const profileData = {
    name: updates.name !== undefined ? updates.name : user.user_metadata?.name,
    phone: updates.phone !== undefined ? updates.phone : undefined,
    address: updates.address !== undefined ? updates.address : undefined,
    updatedAt: new Date().toISOString()
  }

  // Only store non-undefined values
  const cleanProfileData = Object.fromEntries(
    Object.entries(profileData).filter(([_, value]) => value !== undefined)
  )

  await kv.set(`profile:${userId}`, cleanProfileData)

  // Get current profile to include avatarUrl
  const currentProfile = await kv.get(`profile:${userId}`) || {}

  // Return updated user data
  const updatedUser = {
    id: user.id,
    email: user.email,
    name: updates.name !== undefined ? updates.name : user.user_metadata?.name,
    phone: cleanProfileData.phone,
    address: cleanProfileData.address,
    avatarUrl: currentProfile.avatarUrl,
    role: user.user_metadata?.role || 'citizen',
    categories: user.user_metadata?.categories || [],
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at
  }

  return updatedUser
}

export async function uploadAvatar(userId: string, file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Only images are allowed.')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  const fileExtension = file.name.split('.').pop()
  const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`
  const bucketName = 'make-accecacf-issue-photos' // Using existing bucket

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file)

  if (error) throw error

  // Get signed URL for the avatar
  const { data: signedUrlData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry

  if (!signedUrlData?.signedUrl) {
    throw new Error('Failed to generate avatar URL')
  }

  // Update profile with avatar URL
  const existingProfile = await kv.get(`profile:${userId}`) || {}
  const updatedProfile = {
    ...existingProfile,
    avatarUrl: signedUrlData.signedUrl,
    updatedAt: new Date().toISOString()
  }

  await kv.set(`profile:${userId}`, updatedProfile)

  return signedUrlData.signedUrl
}
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import { ValidationError } from '../utils/errors.ts'
import { getUserReputation } from './issueModel.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function getProfile(userId: string, user: any) {
  const profile = await kv.get(`profile:${userId}`) || {}
  const reputation = await getUserReputation(userId)

  const userData = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || profile.name,
    phone: profile.phone,
    address: profile.address,
    avatarUrl: profile.avatarUrl,
    role: user.user_metadata?.role || 'citizen',
    categories: user.user_metadata?.categories || [],
    availability: profile.availability || 'available',
    location: profile.location || null,
    locationUpdatedAt: profile.locationUpdatedAt || null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    reputation,
    marketplaceStatus: user.user_metadata?.marketplaceStatus,
    stripeOnboardingComplete: !!user.user_metadata?.stripeOnboardingComplete,
  }

  return userData
}

export async function updateProfile(userId: string, user: any, updates: {
  name?: string
  phone?: string
  address?: string
  availability?: 'available' | 'busy' | 'off_duty'
  location?: { lat: number; lng: number } | null
}) {
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

  // Merge with existing profile data so unrelated fields (e.g. avatarUrl,
  // availability) set by other endpoints aren't wiped out by this update.
  const existingProfile = await kv.get(`profile:${userId}`) || {}

  const profileData = {
    ...existingProfile,
    name: updates.name !== undefined ? updates.name : existingProfile.name ?? user.user_metadata?.name,
    phone: updates.phone !== undefined ? updates.phone : existingProfile.phone,
    address: updates.address !== undefined ? updates.address : existingProfile.address,
    availability: updates.availability !== undefined ? updates.availability : existingProfile.availability,
    location: updates.location !== undefined ? updates.location : existingProfile.location,
    locationUpdatedAt: updates.location !== undefined ? new Date().toISOString() : existingProfile.locationUpdatedAt,
    updatedAt: new Date().toISOString()
  }

  // Only store non-undefined values
  const cleanProfileData = Object.fromEntries(
    Object.entries(profileData).filter(([_, value]) => value !== undefined)
  )

  await kv.set(`profile:${userId}`, cleanProfileData)

  const reputation = await getUserReputation(userId)

  // Return updated user data
  const updatedUser = {
    id: user.id,
    email: user.email,
    name: cleanProfileData.name,
    phone: cleanProfileData.phone,
    address: cleanProfileData.address,
    avatarUrl: cleanProfileData.avatarUrl,
    role: user.user_metadata?.role || 'citizen',
    categories: user.user_metadata?.categories || [],
    availability: cleanProfileData.availability || 'available',
    location: cleanProfileData.location || null,
    locationUpdatedAt: cleanProfileData.locationUpdatedAt || null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    reputation
  }

  return updatedUser
}

// Ranks citizens by their derived reputation points for the community
// leaderboard. Recomputes every user's reputation on each call - fine at
// civic-app scale, but would need caching if the user base grew large.
export async function getLeaderboard(limit = 20) {
  const { data: authUsers, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (error) throw error

  const entries = await Promise.all(
    (authUsers?.users || []).map(async (authUser) => {
      const reputation = await getUserReputation(authUser.id)
      const profile = await kv.get(`profile:${authUser.id}`) || {}
      return {
        userId: authUser.id,
        name: authUser.user_metadata?.name || profile.name || 'Anonymous',
        avatarUrl: profile.avatarUrl || null,
        points: reputation.points,
        badge: reputation.badge,
      }
    })
  )

  return entries
    .filter(entry => entry.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((entry, index) => ({ rank: index + 1, ...entry }))
}

export async function uploadAvatar(userId: string, file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new ValidationError('Invalid file type. Only images are allowed.')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new ValidationError('File size must be less than 5MB')
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
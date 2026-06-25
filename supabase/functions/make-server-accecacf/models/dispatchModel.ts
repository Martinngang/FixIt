import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import { NotFoundError } from '../utils/errors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Issues in these statuses still occupy a technician's time and count
// towards their current workload.
const ACTIVE_STATUSES = ['assigned', 'in-progress']

const EARTH_RADIUS_KM = 6371

export function haversineDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// How much each factor matters depends on how urgent the issue is: for a
// high-priority issue, getting the nearest available technician there
// quickly matters more than evening out workloads; for a low-priority
// issue, balancing workload across the team matters more than shaving a
// few minutes off travel time.
const PRIORITY_WEIGHTS: Record<string, { skill: number; availability: number; distance: number; workload: number }> = {
  high: { skill: 1.5, availability: 2, distance: 2, workload: 0.5 },
  medium: { skill: 1, availability: 1, distance: 1, workload: 1 },
  low: { skill: 1, availability: 1, distance: 0.5, workload: 1.5 },
}

export async function suggestTechnicians(issueId: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')

  const { data: authUsers, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (error) throw error

  const technicians = (authUsers?.users || []).filter(
    (authUser) =>
      authUser.user_metadata?.role === 'technician' &&
      (authUser.user_metadata?.organizationId ?? null) === (issue.organizationId ?? null)
  )

  const allIssues = await kv.getByPrefix('issue:')
  const weights = PRIORITY_WEIGHTS[issue.priority] || PRIORITY_WEIGHTS.medium

  const suggestions = await Promise.all(
    technicians.map(async (tech) => {
      const profile = await kv.get(`profile:${tech.id}`) || {}
      const categories: string[] = tech.user_metadata?.categories || []
      const availability: 'available' | 'busy' | 'off_duty' = profile.availability || 'available'
      const location = profile.location || null

      const skillMatch = categories.includes(issue.category)
      const activeAssignments = allIssues.filter(
        (i) => i.assignedTo === tech.id && ACTIVE_STATUSES.includes(i.status)
      ).length

      const distanceKm = issue.coordinates && location
        ? haversineDistance(issue.coordinates, location)
        : null

      // Each component is scored 0-100 before weighting.
      const skillScore = skillMatch ? 100 : 30
      const availabilityScore = availability === 'available' ? 100 : availability === 'busy' ? 40 : 0
      const distanceScore = distanceKm === null ? 50 : Math.max(0, 100 - distanceKm * 5)
      const workloadScore = Math.max(0, 100 - activeAssignments * 25)

      const totalScore =
        skillScore * weights.skill +
        availabilityScore * weights.availability +
        distanceScore * weights.distance +
        workloadScore * weights.workload

      const maxScore = 100 * (weights.skill + weights.availability + weights.distance + weights.workload)

      return {
        technicianId: tech.id,
        name: tech.user_metadata?.name || tech.email,
        email: tech.email,
        categories,
        availability,
        location,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
        activeAssignments,
        skillMatch,
        score: Math.round((totalScore / maxScore) * 100),
      }
    })
  )

  return suggestions.sort((a, b) => b.score - a.score)
}

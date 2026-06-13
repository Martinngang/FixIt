import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.ts'
import { classifyIssue } from '../utils/gemini.ts'
import { getCompletedTaskCount } from './volunteerModel.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage bucket on startup
export async function initializeStorage() {
  const bucketName = 'make-accecacf-issue-photos'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)

  if (!bucketExists) {
    console.log('Creating issue photos bucket...')
    await supabase.storage.createBucket(bucketName, { public: false })
  }
}

export async function createIssue(issueData: any) {
  // Let AI suggest a category/priority from the description for more
  // accurate routing. Falls back to the citizen's own selections if the
  // classifier is unavailable or fails - this must never block reporting.
  const classification = await classifyIssue(issueData.title, issueData.description)

  const issue = {
    id: crypto.randomUUID(),
    ...issueData,
    category: classification?.category || issueData.category,
    priority: classification?.priority || issueData.priority,
    reportedCategory: issueData.category,
    reportedPriority: issueData.priority,
    aiClassification: classification,
    sentiment: classification?.sentiment || 'neutral',
    flagged: classification?.flagged || false,
    status: 'reported',
    upvotes: 0,
    upvotedBy: [],
    reportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issue.id}`, issue)
  await kv.set(`user_issue:${issue.reportedBy}:${issue.id}`, issue.id)

  return issue
}

export async function autoAssignIssue(issue: any) {
  if (issue.category === 'Other') return issue

  const { data: authUsers, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  if (!error && authUsers?.users) {
    const technicians = authUsers.users.filter(user =>
      user.user_metadata?.role === 'technician' &&
      (user.user_metadata?.categories || []).includes(issue.category)
    )

    if (technicians.length > 0) {
      const assignedTechnician = technicians[Math.floor(Math.random() * technicians.length)]

      const updatedIssue = {
        ...issue,
        assignedTo: assignedTechnician.id,
        assignedBy: 'system',
        assignedAt: new Date().toISOString(),
        status: 'assigned',
        updatedAt: new Date().toISOString()
      }

      await kv.set(`issue:${issue.id}`, updatedIssue)

      // Send notification to technician
      const notification = {
        id: crypto.randomUUID(),
        recipientId: assignedTechnician.id,
        title: 'New Issue Assigned',
        message: `A new issue has been automatically assigned to you: ${issue.title}`,
        type: 'assignment',
        relatedIssueId: issue.id,
        senderId: 'system',
        senderName: 'System',
        createdAt: new Date().toISOString(),
        read: false
      }

      await kv.set(`notification:${assignedTechnician.id}:${notification.id}`, notification)

      return updatedIssue
    }
  }

  return issue
}

export async function getAllIssues() {
  const issues = await kv.getByPrefix('issue:')
  return issues.sort((a, b) =>
    new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  )
}

export async function getIssue(issueId: string) {
  return await kv.get(`issue:${issueId}`)
}

export async function getUserIssues(userId: string) {
  const userIssueIds = await kv.getByPrefix(`user_issue:${userId}:`)
  const issues = await kv.mget(userIssueIds.map(id => `issue:${id}`))
  return issues.filter(Boolean).sort((a, b) =>
    new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  )
}

export async function getTechnicianTasks(userId: string) {
  const allIssues = await kv.getByPrefix('issue:')
  const assignedIssues = allIssues.filter(issue => issue.assignedTo === userId)

  return assignedIssues.sort((a, b) =>
    new Date(b.assignedAt || b.reportedAt).getTime() - new Date(a.assignedAt || a.reportedAt).getTime()
  )
}

export async function updateIssue(issueId: string, updates: any) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')

  const updatedIssue = {
    ...issue,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function assignIssue(issueId: string, technicianId: string, assignedBy: string, notes?: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')

  const updatedIssue = {
    ...issue,
    assignedTo: technicianId,
    assignedBy,
    assignedAt: new Date().toISOString(),
    assignmentNotes: notes || '',
    status: 'assigned',
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function toggleUpvote(issueId: string, userId: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')

  const upvotedBy: string[] = issue.upvotedBy || []
  const hasUpvoted = upvotedBy.includes(userId)

  const updatedUpvotedBy = hasUpvoted
    ? upvotedBy.filter((id: string) => id !== userId)
    : [...upvotedBy, userId]

  const updatedIssue = {
    ...issue,
    upvotedBy: updatedUpvotedBy,
    upvotes: updatedUpvotedBy.length,
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function assignToMe(issueId: string, userId: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')
  if (issue.assignedTo) throw new ConflictError('Issue already assigned')

  const updatedIssue = {
    ...issue,
    assignedTo: userId,
    assignedBy: userId,
    assignedAt: new Date().toISOString(),
    status: 'in-progress',
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function uploadPhoto(issueId: string, file: File, userId: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new NotFoundError('Issue not found')
  if (issue.reportedBy !== userId) throw new ForbiddenError('Only the issue reporter can upload photos')

  const fileExtension = file.name.split('.').pop()
  const fileName = `${issueId}_${Date.now()}.${fileExtension}`
  const bucketName = 'make-accecacf-issue-photos'

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file)

  if (error) throw error

  // Get signed URL for the photo
  const { data: signedUrlData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry

  const updatedIssue = {
    ...issue,
    photoUrl: signedUrlData?.signedUrl,
    updatedAt: new Date().toISOString()
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function updateStatus(issueId: string, status: string, updatedBy: string, adminNote?: string) {
  const existingIssue = await kv.get(`issue:${issueId}`)
  if (!existingIssue) throw new NotFoundError('Issue not found')

  const updatedIssue = {
    ...existingIssue,
    status,
    adminNote: adminNote || existingIssue.adminNote,
    updatedAt: new Date().toISOString(),
    updatedBy
  }

  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function getStats() {
  const issues = await kv.getByPrefix('issue:')

  const stats = {
    total: issues.length,
    byStatus: issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {}),
    byCategory: issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {}),
    byPriority: issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1
      return acc
    }, {}),
    recentActivity: issues
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        updatedAt: issue.updatedAt,
        category: issue.category
      }))
  }

  return stats
}

export async function getAnalytics() {
  const issues = await kv.getByPrefix('issue:')
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Filter issues from last 30 days
  const recentIssues = issues.filter(issue =>
    new Date(issue.reportedAt) >= thirtyDaysAgo
  )

  // Group by day for trending data
  const dailyReports = recentIssues.reduce((acc, issue) => {
    const date = new Date(issue.reportedAt).toDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Calculate resolution rate
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved')
  const resolutionRate = issues.length > 0 ? (resolvedIssues.length / issues.length) * 100 : 0

  // Average resolution time
  const resolvedWithTime = resolvedIssues.filter(issue => issue.updatedAt && issue.reportedAt)
  const avgResolutionTime = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, issue) => {
        const reported = new Date(issue.reportedAt).getTime()
        const resolved = new Date(issue.updatedAt).getTime()
        return sum + (resolved - reported)
      }, 0) / resolvedWithTime.length
    : 0

  const analytics = {
    totalIssues: issues.length,
    recentIssues: recentIssues.length,
    resolutionRate: Math.round(resolutionRate),
    avgResolutionDays: Math.round(avgResolutionTime / (1000 * 60 * 60 * 24)),
    dailyReports: Object.entries(dailyReports)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count })),
    categoryBreakdown: issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {}),
    priorityDistribution: issues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1
      return acc
    }, {}),
    statusFlow: issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {})
  }

  return analytics
}

// Surfaces recurring problem locations so authorities can plan proactive
// maintenance instead of reacting to each report individually. Groups all
// issues by location, keeping only locations with repeat reports.
export async function getHotspots() {
  const issues = await kv.getByPrefix('issue:')
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const locations = new Map<string, {
    location: string
    totalIssues: number
    recentIssues: number
    flaggedIssues: number
    categories: Record<string, number>
    resolutionTimes: number[]
  }>()

  for (const issue of issues) {
    const key = (issue.location || '').trim().toLowerCase()
    if (!key) continue

    if (!locations.has(key)) {
      locations.set(key, {
        location: issue.location,
        totalIssues: 0,
        recentIssues: 0,
        flaggedIssues: 0,
        categories: {},
        resolutionTimes: [],
      })
    }

    const entry = locations.get(key)!
    entry.totalIssues++
    if (new Date(issue.reportedAt) >= ninetyDaysAgo) entry.recentIssues++
    if (issue.flagged) entry.flaggedIssues++
    entry.categories[issue.category] = (entry.categories[issue.category] || 0) + 1

    if (issue.status === 'resolved') {
      const reported = new Date(issue.reportedAt).getTime()
      const resolved = new Date(issue.updatedAt).getTime()
      entry.resolutionTimes.push(resolved - reported)
    }
  }

  return Array.from(locations.values())
    .filter(entry => entry.totalIssues >= 2)
    .map(entry => ({
      location: entry.location,
      totalIssues: entry.totalIssues,
      recentIssues: entry.recentIssues,
      flaggedIssues: entry.flaggedIssues,
      topCategory: Object.entries(entry.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Other',
      categories: entry.categories,
      avgResolutionDays: entry.resolutionTimes.length > 0
        ? Math.round(entry.resolutionTimes.reduce((sum, t) => sum + t, 0) / entry.resolutionTimes.length / (1000 * 60 * 60 * 24))
        : null,
    }))
    .sort((a, b) => b.totalIssues - a.totalIssues)
    .slice(0, 10)
}

// Read-only, anonymized issue feed for the public Open Data API. Strips any
// fields that identify the reporter, assigned staff, or internal moderation
// state, leaving only the civic information researchers/planners care about.
export async function getPublicIssues({ status, category, limit = 50, offset = 0 }: {
  status?: string
  category?: string
  limit?: number
  offset?: number
}) {
  let issues = await kv.getByPrefix('issue:')

  if (status) issues = issues.filter(issue => issue.status === status)
  if (category) issues = issues.filter(issue => issue.category === category)

  issues = issues.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())

  const total = issues.length
  const page = issues.slice(offset, offset + limit)

  return {
    total,
    limit,
    offset,
    issues: page.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      coordinates: issue.coordinates ?? null,
      priority: issue.priority,
      status: issue.status,
      upvotes: issue.upvotes || 0,
      reportedAt: issue.reportedAt,
      updatedAt: issue.updatedAt,
    })),
  }
}

export const REPUTATION_POINTS = {
  issueReported: 5,
  issueResolved: 15,
  upvoteReceived: 2,
  volunteerTaskCompleted: 10,
} as const

export const REPUTATION_BADGES = [
  { key: 'newcomer', threshold: 0 },
  { key: 'active_citizen', threshold: 25 },
  { key: 'civic_contributor', threshold: 75 },
  { key: 'community_champion', threshold: 150 },
] as const

// Derives a citizen's reputation purely from their existing issue history -
// no separate point ledger to keep in sync. Rewards reporting, having
// reports resolved, and community endorsement via upvotes received.
export async function getUserReputation(userId: string) {
  const issues = await getUserIssues(userId)

  const reported = issues.length
  const resolved = issues.filter(issue => issue.status === 'resolved').length
  const upvotesReceived = issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0)
  const volunteered = await getCompletedTaskCount(userId)

  const points =
    reported * REPUTATION_POINTS.issueReported +
    resolved * REPUTATION_POINTS.issueResolved +
    upvotesReceived * REPUTATION_POINTS.upvoteReceived +
    volunteered * REPUTATION_POINTS.volunteerTaskCompleted

  let badge: typeof REPUTATION_BADGES[number]['key'] = REPUTATION_BADGES[0].key
  let nextBadge: typeof REPUTATION_BADGES[number] | null = null

  for (let i = 0; i < REPUTATION_BADGES.length; i++) {
    if (points >= REPUTATION_BADGES[i].threshold) {
      badge = REPUTATION_BADGES[i].key
      nextBadge = REPUTATION_BADGES[i + 1] || null
    }
  }

  return {
    points,
    badge,
    nextBadge: nextBadge
      ? { key: nextBadge.key, pointsNeeded: nextBadge.threshold - points }
      : null,
    breakdown: { reported, resolved, upvotesReceived, volunteered },
  }
}
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.ts'
import { classifyIssue } from '../utils/gemini.ts'
import { sendEmail } from '../utils/email.ts'
import { FRONTEND_URL } from '../utils/stripe.ts'
import { getCompletedTaskCount } from './volunteerModel.ts'
import { computeCredibility, getReporterTrust, recordReportOutcome } from './credibilityModel.ts'
import { listUsers } from './userModel.ts'
import * as notificationModel from './notificationModel.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Recomputes and mutates an issue's credibility fields in place - shared by
// every mutation that changes a credibility signal (photo added, upvoted,
// reported afresh) so they all go through the same scoring logic.
async function applyCredibility(issue: any) {
  const [allIssues, reporterTrust] = await Promise.all([
    kv.getByPrefix('issue:'),
    getReporterTrust(issue.reportedBy),
  ])
  const credibility = computeCredibility(issue, allIssues, reporterTrust)
  issue.credibilityScore = credibility.score
  issue.credibilityLevel = credibility.level
  issue.credibilitySignals = credibility.signals
}

// Records the reporter's trust outcome the first time an issue reaches a
// terminal status (resolved/rejected), guarding against double-counting if
// staff later flip the status again.
async function maybeRecordTrustOutcome(issue: any, updatedIssue: any) {
  if (updatedIssue.trustOutcomeRecorded) return
  if (updatedIssue.status !== 'resolved' && updatedIssue.status !== 'rejected') return

  await recordReportOutcome(issue.reportedBy, updatedIssue.status)
  updatedIssue.trustOutcomeRecorded = true
}

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
  // Skipped for organization tenants, since the classifier's category enum
  // is fixed to the public city categories and wouldn't match an org's
  // custom categories.
  const classification = issueData.organizationId
    ? null
    : await classifyIssue(issueData.title, issueData.description)

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

  await applyCredibility(issue)

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
      (user.user_metadata?.categories || []).includes(issue.category) &&
      (user.user_metadata?.organizationId ?? null) === (issue.organizationId ?? null)
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
      await notificationModel.createNotification({
        recipientId: assignedTechnician.id,
        title: 'New Issue Assigned',
        message: `A new issue has been automatically assigned to you: ${issue.title}`,
        type: 'assignment',
        relatedIssueId: issue.id,
        senderName: 'System',
      })

      if (assignedTechnician.email) {
        await sendEmail({
          to: assignedTechnician.email,
          subject: `New issue assigned: ${issue.title}`,
          html: `
            <p>A new issue has been automatically assigned to you.</p>
            <p><strong>${escapeHtml(issue.title)}</strong></p>
            <p>Category: ${escapeHtml(issue.category)}<br>
            Priority: ${escapeHtml(issue.priority)}<br>
            Location: ${escapeHtml(issue.location)}</p>
            <p><a href="${FRONTEND_URL}/my-tasks">View in CIRT</a></p>
          `,
        })
      }

      return updatedIssue
    }
  }

  return issue
}

// Emails every admin scoped to this issue's tenant (or every platform admin
// for public city issues, where organizationId is null) whenever a citizen
// reports something - separate from the technician auto-assignment email
// above, since admins should hear about every report regardless of whether
// auto-assignment found a technician.
export async function notifyAdminsOfNewIssue(issue: any) {
  const users = await listUsers(issue.organizationId ?? null)
  const admins = users.filter((u: any) => u.role === 'admin' && u.email)

  await Promise.all(admins.map((admin: any) => sendEmail({
    to: admin.email!,
    subject: `New issue reported: ${issue.title}`,
    html: `
      <p>A new issue was just reported.</p>
      <p><strong>${escapeHtml(issue.title)}</strong></p>
      <p>Category: ${escapeHtml(issue.category)}<br>
      Priority: ${escapeHtml(issue.priority)}<br>
      Location: ${escapeHtml(issue.location)}<br>
      Reported by: ${escapeHtml(issue.reporterName || 'Unknown')}</p>
      <p><a href="${FRONTEND_URL}/admin">View in CIRT</a></p>
    `,
  })))
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function getAllIssues(organizationId: string | null) {
  const issues = await kv.getByPrefix('issue:')
  return issues
    .filter(issue => (issue.organizationId ?? null) === organizationId)
    .sort((a, b) =>
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

  // A marketplace contractor marking their claimed job resolved completes
  // the marketplace job too, making it eligible for payment.
  if (updates.status === 'resolved' && issue.marketplace?.status === 'claimed') {
    updatedIssue.marketplace = {
      ...issue.marketplace,
      status: 'completed',
      completedAt: updatedIssue.updatedAt
    }
  }

  await maybeRecordTrustOutcome(issue, updatedIssue)
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

  await applyCredibility(updatedIssue)
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

  await applyCredibility(updatedIssue)
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

  // A marketplace contractor marking their claimed job resolved completes
  // the marketplace job too, making it eligible for payment.
  if (status === 'resolved' && existingIssue.marketplace?.status === 'claimed') {
    updatedIssue.marketplace = {
      ...existingIssue.marketplace,
      status: 'completed',
      completedAt: updatedIssue.updatedAt
    }
  }

  await maybeRecordTrustOutcome(existingIssue, updatedIssue)
  await kv.set(`issue:${issueId}`, updatedIssue)
  return updatedIssue
}

export async function getStats(organizationId: string | null) {
  const issues = (await kv.getByPrefix('issue:'))
    .filter(issue => (issue.organizationId ?? null) === organizationId)

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

export async function getAnalytics(organizationId: string | null) {
  const issues = (await kv.getByPrefix('issue:'))
    .filter(issue => (issue.organizationId ?? null) === organizationId)
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
export async function getHotspots(organizationId: string | null) {
  const issues = (await kv.getByPrefix('issue:'))
    .filter(issue => (issue.organizationId ?? null) === organizationId)
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

  // Open data is city-only - private organization data must never appear
  // in the public feed, regardless of any future caller context.
  issues = issues.filter(issue => (issue.organizationId ?? null) === null)

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

// Rough average cost (in USD) to the city to resolve one issue in each
// category. Used only to give citizens an illustrative sense of the value
// of their contributions - not a real budget figure.
export const CATEGORY_IMPACT_COST: Record<string, number> = {
  'Road & Transportation': 450,
  'Water & Utilities': 600,
  'Parks & Recreation': 200,
  'Public Safety': 350,
  'Waste Management': 150,
  'Street Lighting': 180,
  'Public Buildings': 300,
  'Environmental': 250,
  'Other': 120,
}

// Aggregates a citizen's own issue history into a personalized "impact
// report" - how many of their reports were resolved, broken down by
// category, plus an illustrative estimate of the value returned to the city.
export async function getUserImpact(userId: string) {
  const issues = await getUserIssues(userId)
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved')

  const categoryBreakdown = issues.reduce((acc, issue) => {
    const category = issue.category || 'Other'
    if (!acc[category]) acc[category] = { reported: 0, resolved: 0 }
    acc[category].reported++
    if (issue.status === 'resolved') acc[category].resolved++
    return acc
  }, {} as Record<string, { reported: number; resolved: number }>)

  const estimatedSavings = resolvedIssues.reduce((sum, issue) => {
    return sum + (CATEGORY_IMPACT_COST[issue.category] ?? CATEGORY_IMPACT_COST.Other)
  }, 0)

  const resolutionTimes = resolvedIssues
    .filter(issue => issue.reportedAt && issue.updatedAt)
    .map(issue => new Date(issue.updatedAt).getTime() - new Date(issue.reportedAt).getTime())

  const avgResolutionDays = resolutionTimes.length > 0
    ? Math.round(resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length / (1000 * 60 * 60 * 24))
    : null

  return {
    totalReported: issues.length,
    totalResolved: resolvedIssues.length,
    resolutionRate: issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0,
    categoryBreakdown,
    estimatedSavings,
    avgResolutionDays,
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
  // Rejected reports (confirmed false by a technician/admin) don't earn
  // reporting points - otherwise spamming fake reports would be free
  // reputation.
  const reportedForPoints = issues.filter(issue => issue.status !== 'rejected').length
  const upvotesReceived = issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0)
  const volunteered = await getCompletedTaskCount(userId)
  const trust = await getReporterTrust(userId)
  const rejectionRate = trust.totalReports > 0 ? trust.rejectedReports / trust.totalReports : null

  const points =
    reportedForPoints * REPUTATION_POINTS.issueReported +
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
    breakdown: { reported, resolved, upvotesReceived, volunteered, rejectionRate },
  }
}
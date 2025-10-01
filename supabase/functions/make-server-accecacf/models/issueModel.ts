import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'

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
  const issue = {
    id: crypto.randomUUID(),
    ...issueData,
    status: 'reported',
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
  if (!issue) throw new Error('Issue not found')

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
  if (!issue) throw new Error('Issue not found')

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

export async function assignToMe(issueId: string, userId: string) {
  const issue = await kv.get(`issue:${issueId}`)
  if (!issue) throw new Error('Issue not found')
  if (issue.assignedTo) throw new Error('Issue already assigned')

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
  if (!issue) throw new Error('Issue not found')
  if (issue.reportedBy !== userId) throw new Error('Only the issue reporter can upload photos')

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
  if (!existingIssue) throw new Error('Issue not found')

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
import "jsr:@std/dotenv/load";

import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage bucket on startup
async function initializeStorage() {
  const bucketName = 'make-accecacf-issue-photos'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    console.log('Creating issue photos bucket...')
    await supabase.storage.createBucket(bucketName, { public: false })
  }
}

await initializeStorage()

app.post('/make-server-accecacf/issues/:id/assign-to-me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user?.id) return c.json({ error: 'Unauthorized' }, 401)

    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') return c.json({ error: 'Technician access required' }, 403)

    const issueId = c.req.param('id')
    const issue = await kv.get(`issue:${issueId}`)
    if (!issue) return c.json({ error: 'Issue not found' }, 404)
    if (issue.assignedTo) return c.json({ error: 'Issue already assigned' }, 400)

    const updatedIssue = {
      ...issue,
      assignedTo: user.id,
      assignedBy: user.id,
      assignedAt: new Date().toISOString(),
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    }

    await kv.set(`issue:${issueId}`, updatedIssue)

    const notification = {
      id: crypto.randomUUID(),
      recipientId: user.id,
      title: 'Issue Assigned',
      message: `You have assigned yourself to issue: ${issue.title}`,
      type: 'task_assigned',
      relatedIssueId: issueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email,
      createdAt: new Date().toISOString(),
      read: false
    }

    await kv.set(`notification:${user.id}:${notification.id}`, notification)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Self-assign issue error:', error)
    return c.json({ error: 'Failed to assign issue' }, 500)
  }
})

// Update issue (technician only)
app.put('/make-server-accecacf/issues/:id/update', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (!user?.id) return c.json({ error: 'Unauthorized' }, 401)

    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') return c.json({ error: 'Technician access required' }, 403)

    const issueId = c.req.param('id')
    const issue = await kv.get(`issue:${issueId}`)
    if (!issue) return c.json({ error: 'Issue not found' }, 404)

    // Check if the technician is assigned to this issue
    if (issue.assignedTo !== user.id) return c.json({ error: 'Not assigned to this issue' }, 403)

    const { status, technicianNote, assignedTo, estimatedCompletionDate } = await c.req.json()

    const updatedIssue = {
      ...issue,
      status: status || issue.status,
      technicianNote: technicianNote !== undefined ? technicianNote : issue.technicianNote,
      assignedTo: assignedTo || issue.assignedTo,
      estimatedCompletionDate: estimatedCompletionDate !== undefined ? estimatedCompletionDate : issue.estimatedCompletionDate,
      updatedAt: new Date().toISOString()
    }

    await kv.set(`issue:${issueId}`, updatedIssue)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Update issue error:', error)
    return c.json({ error: 'Failed to update issue' }, 500)
  }
})


// User signup
app.post('/make-server-accecacf/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// Create new issue
app.post('/make-server-accecacf/issues', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { title, description, category, location, priority = 'medium', coordinates } = await c.req.json()
    
    const issue = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      location,
      priority,
      status: 'reported',
      reportedBy: user.id,
      reporterName: user.user_metadata?.name || user.email,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coordinates: coordinates || null,
      photoUrl: null
    }
    
    await kv.set(`issue:${issue.id}`, issue)
    await kv.set(`user_issue:${user.id}:${issue.id}`, issue.id)
    
    return c.json({ success: true, issue })
  } catch (error) {
    console.log('Create issue error:', error)
    return c.json({ error: 'Failed to create issue' }, 500)
  }
})

// Upload photo for issue
app.post('/make-server-accecacf/issues/:id/photo', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const issueId = c.req.param('id')
    const issue = await kv.get(`issue:${issueId}`)
    
    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404)
    }
    
    if (issue.reportedBy !== user.id) {
      return c.json({ error: 'Only the issue reporter can upload photos' }, 403)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('photo') as File
    
    if (!file) {
      return c.json({ error: 'No photo file provided' }, 400)
    }
    
    const fileExtension = file.name.split('.').pop()
    const fileName = `${issueId}_${Date.now()}.${fileExtension}`
    const bucketName = 'make-accecacf-issue-photos'
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)
    
    if (error) {
      console.log('Photo upload error:', error)
      return c.json({ error: 'Failed to upload photo' }, 500)
    }
    
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
    
    return c.json({ 
      success: true, 
      issue: updatedIssue, 
      message: 'Photo uploaded successfully' 
    })
  } catch (error) {
    console.log('Photo upload server error:', error)
    return c.json({ error: 'Internal server error during photo upload' }, 500)
  }
})

// Get all issues
app.get('/make-server-accecacf/issues', async (c) => {
  try {
    const issues = await kv.getByPrefix('issue:')
    const sortedIssues = issues.sort((a, b) => 
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    
    return c.json({ issues: sortedIssues })
  } catch (error) {
    console.log('Get issues error:', error)
    return c.json({ error: 'Failed to fetch issues' }, 500)
  }
})

// Get user's issues
app.get('/make-server-accecacf/my-issues', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userIssueIds = await kv.getByPrefix(`user_issue:${user.id}:`)
    const issues = await kv.mget(userIssueIds.map(id => `issue:${id}`))
    const sortedIssues = issues.filter(Boolean).sort((a, b) => 
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    
    return c.json({ issues: sortedIssues })
  } catch (error) {
    console.log('Get user issues error:', error)
    return c.json({ error: 'Failed to fetch user issues' }, 500)
  }
})

// Get technician's assigned tasks
app.get('/make-server-accecacf/my-tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get all issues and filter by assigned technician
    const allIssues = await kv.getByPrefix('issue:')
    const assignedIssues = allIssues.filter(issue => issue.assignedTo === user.id)
    
    const sortedIssues = assignedIssues.sort((a, b) => 
      new Date(b.assignedAt || b.reportedAt).getTime() - new Date(a.assignedAt || a.reportedAt).getTime()
    )
    
    return c.json({ issues: sortedIssues })
  } catch (error) {
    console.log('Get technician tasks error:', error)
    return c.json({ error: 'Failed to fetch assigned tasks' }, 500)
  }
})

// Update issue status
app.patch('/make-server-accecacf/issues/:id/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const issueId = c.req.param('id')
    const { status, adminNote } = await c.req.json()
    
    const existingIssue = await kv.get(`issue:${issueId}`)
    if (!existingIssue) {
      return c.json({ error: 'Issue not found' }, 404)
    }
    
    const updatedIssue = {
      ...existingIssue,
      status,
      adminNote: adminNote || existingIssue.adminNote,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    }
    
    await kv.set(`issue:${issueId}`, updatedIssue)
    
    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Update issue status error:', error)
    return c.json({ error: 'Failed to update issue status' }, 500)
  }
})

// Get issue statistics
app.get('/make-server-accecacf/stats', async (c) => {
  try {
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
    
    return c.json({ stats })
  } catch (error) {
    console.log('Get stats error:', error)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// Get analytics data for dashboard
app.get('/make-server-accecacf/analytics', async (c) => {
  try {
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
    
    return c.json({ analytics })
  } catch (error) {
    console.log('Get analytics error:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// Helper function to get effective user role (allows temporary override for testing)
const getEffectiveUserRole = (user: any, request: any) => {
  // Check for temporary role override header (for testing purposes)
  const tempRole = request.header('X-Temp-Role')
  if (tempRole && ['citizen', 'technician', 'admin'].includes(tempRole)) {
    console.log(`Using temporary role override: ${tempRole} for user ${user.id}`)
    return tempRole
  }
  
  // Use actual user role from metadata
  return user.user_metadata?.role || 'citizen'
}

// Get all users (admin only)
app.get('/make-server-accecacf/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Check if user is admin (with temp role override support)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    // Get users from auth service
    const { data: authUsers, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    if (error) {
      console.log('List users error:', error)
      return c.json({ error: 'Failed to fetch users' }, 500)
    }
    
    const users = authUsers?.users?.map(authUser => ({
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'Unknown',
      role: authUser.user_metadata?.role || 'citizen',
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at,
      email_confirmed_at: authUser.email_confirmed_at
    })) || []
    
    return c.json({ users })
  } catch (error) {
    console.log('Get users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Update user role (admin only)
app.patch('/make-server-accecacf/users/:id/role', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const userId = c.req.param('id')
    const { role } = await c.req.json()
    
    if (!['citizen', 'technician', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400)
    }
    
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    })
    
    if (error) {
      console.log('Update user role error:', error)
      return c.json({ error: 'Failed to update user role' }, 500)
    }
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log('Update user role error:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Get notifications for user
app.get('/make-server-accecacf/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const notifications = await kv.getByPrefix(`notification:${user.id}:`)
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return c.json({ notifications: sortedNotifications })
  } catch (error) {
    console.log('Get notifications error:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

// Send notification
app.post('/make-server-accecacf/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { recipientId, title, message, type = 'info', relatedIssueId } = await c.req.json()

    // Get recipients based on recipientId
    let recipients: string[] = []
    if (recipientId === 'all' || recipientId === 'technicians' || recipientId === 'citizens') {
      const { data: authUsers, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (error) throw new Error('Failed to fetch users')
      const users = authUsers?.users?.map(authUser => ({
        id: authUser.id,
        role: authUser.user_metadata?.role || 'citizen'
      })) || []
      if (recipientId === 'all') {
        recipients = users.map(u => u.id)
      } else if (recipientId === 'technicians') {
        recipients = users.filter(u => u.role === 'technician').map(u => u.id)
      } else if (recipientId === 'citizens') {
        recipients = users.filter(u => u.role === 'citizen').map(u => u.id)
      }
    } else {
      // Specific user
      recipients = [recipientId]
    }

    // Create notification for each recipient
    const notifications = []
    for (const recId of recipients) {
      const notification = {
        id: crypto.randomUUID(),
        recipientId: recId,
        title,
        message,
        type,
        relatedIssueId: relatedIssueId || null,
        senderId: user.id,
        senderName: user.user_metadata?.name || user.email,
        createdAt: new Date().toISOString(),
        read: false,
        priority: 'medium' as 'low' | 'medium' | 'high'
      }
      await kv.set(`notification:${recId}:${notification.id}`, notification)
      notifications.push(notification)
    }

    return c.json({ success: true, notifications })
  } catch (error) {
    console.log('Send notification error:', error)
    return c.json({ error: 'Failed to send notification' }, 500)
  }
})

// Mark notification as read
app.patch('/make-server-accecacf/notifications/:id/read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const notificationId = c.req.param('id')
    const notification = await kv.get(`notification:${user.id}:${notificationId}`)
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404)
    }
    
    const updatedNotification = {
      ...notification,
      read: true,
      readAt: new Date().toISOString()
    }
    
    await kv.set(`notification:${user.id}:${notificationId}`, updatedNotification)
    
    return c.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.log('Mark notification read error:', error)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
})

// Assign issue to technician (admin only)
app.post('/make-server-accecacf/issues/:id/assign', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const issueId = c.req.param('id')
    const { technicianId, notes } = await c.req.json()
    
    const issue = await kv.get(`issue:${issueId}`)
    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404)
    }
    
    const updatedIssue = {
      ...issue,
      assignedTo: technicianId,
      assignedBy: user.id,
      assignedAt: new Date().toISOString(),
      assignmentNotes: notes || '',
      status: 'assigned',
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`issue:${issueId}`, updatedIssue)
    
    // Create notification for technician
    const notification = {
      id: crypto.randomUUID(),
      recipientId: technicianId,
      title: 'New Assignment',
      message: `You have been assigned to issue: ${issue.title}`,
      type: 'assignment',
      relatedIssueId: issueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email,
      createdAt: new Date().toISOString(),
      read: false
    }
    
    await kv.set(`notification:${technicianId}:${notification.id}`, notification)
    
    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Assign issue error:', error)
    return c.json({ error: 'Failed to assign issue' }, 500)
  }
})

Deno.serve(app.fetch)
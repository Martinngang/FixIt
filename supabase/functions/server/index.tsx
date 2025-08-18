const { Hono } = require('hono')
const { cors } = require('hono/cors')
const { logger } = require('hono/logger')
const { createClient } = require('@supabase/supabase-js')
const kv = require('./kv_store.tsx')
const http = require('http')

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))

app.use('*', logger(console.log))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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

initializeStorage().catch(console.error)

// User signup
app.post('/make-server-accecacf/signup', async (c: any) => {
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
app.post('/make-server-accecacf/issues', async (c: any) => {
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
app.post('/make-server-accecacf/issues/:id/photo', async (c: any) => {
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
    const file = formData.get('photo')
    
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
app.get('/make-server-accecacf/issues', async (c: any) => {
  try {
    const issues = await kv.getByPrefix('issue:')
    const sortedIssues = issues.sort((a: any, b: any) => 
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    
    return c.json({ issues: sortedIssues })
  } catch (error) {
    console.log('Get issues error:', error)
    return c.json({ error: 'Failed to fetch issues' }, 500)
  }
})

// Get user's issues
app.get('/make-server-accecacf/my-issues', async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userIssueIds = await kv.getByPrefix(`user_issue:${user.id}:`)
    const issues = await kv.mget(userIssueIds.map((id: string) => `issue:${id}`))
    const sortedIssues = issues.filter(Boolean).sort((a: any, b: any) => 
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    
    return c.json({ issues: sortedIssues })
  } catch (error) {
    console.log('Get user issues error:', error)
    return c.json({ error: 'Failed to fetch user issues' }, 500)
  }
})

// Update issue status
app.patch('/make-server-accecacf/issues/:id/status', async (c: any) => {
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
app.get('/make-server-accecacf/stats', async (c: any) => {
  try {
    const issues = await kv.getByPrefix('issue:')
    
    const stats = {
      total: issues.length,
      byStatus: issues.reduce((acc: any, issue: any) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1
        return acc
      }, {}),
      byCategory: issues.reduce((acc: any, issue: any) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1
        return acc
      }, {}),
      byPriority: issues.reduce((acc: any, issue: any) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1
        return acc
      }, {}),
      recentActivity: issues
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
        .map((issue: any) => ({
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
app.get('/make-server-accecacf/analytics', async (c: any) => {
  try {
    const issues = await kv.getByPrefix('issue:')
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Filter issues from last 30 days
    const recentIssues = issues.filter((issue: any) => 
      new Date(issue.reportedAt) >= thirtyDaysAgo
    )
    
    // Group by day for trending data
    const dailyReports = recentIssues.reduce((acc: any, issue: any) => {
      const date = new Date(issue.reportedAt).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
    
    // Calculate resolution rate
    const resolvedIssues = issues.filter((issue: any) => issue.status === 'resolved')
    const resolutionRate = issues.length > 0 ? (resolvedIssues.length / issues.length) * 100 : 0
    
    // Average resolution time
    const resolvedWithTime = resolvedIssues.filter((issue: any) => issue.updatedAt && issue.reportedAt)
    const avgResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((sum: number, issue: any) => {
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
      categoryBreakdown: issues.reduce((acc: any, issue: any) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1
        return acc
      }, {}),
      priorityDistribution: issues.reduce((acc: any, issue: any) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1
        return acc
      }, {}),
      statusFlow: issues.reduce((acc: any, issue: any) => {
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

// Create and start the server
const server = http.createServer(app.fetch)
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
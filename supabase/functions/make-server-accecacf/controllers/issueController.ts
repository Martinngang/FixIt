import { Context } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as issueModel from '../models/issueModel.ts'
import * as notificationModel from '../models/notificationModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'

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

export async function assignToMe(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') return c.json({ error: 'Technician access required' }, 403)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) return c.json({ error: 'Issue not found' }, 404)
    if (issue.assignedTo) return c.json({ error: 'Issue already assigned' }, 400)

    const updatedIssue = await issueModel.assignToMe(issueId, user.id)

    const notification = await notificationModel.createNotification({
      recipientId: user.id,
      title: 'Issue Assigned',
      message: `You have assigned yourself to issue: ${issue.title}`,
      type: 'task_assigned',
      relatedIssueId: issueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email
    })

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Self-assign issue error:', error)
    return c.json({ error: 'Failed to assign issue' }, 500)
  }
}

export async function updateIssue(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') return c.json({ error: 'Technician access required' }, 403)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) return c.json({ error: 'Issue not found' }, 404)

    if (issue.assignedTo !== user.id) return c.json({ error: 'Not assigned to this issue' }, 403)

    const { status, technicianNote, assignedTo, estimatedCompletionDate } = await c.req.json()

    const updatedIssue = await issueModel.updateIssue(issueId, {
      status: status || issue.status,
      technicianNote: technicianNote !== undefined ? technicianNote : issue.technicianNote,
      assignedTo: assignedTo || issue.assignedTo,
      estimatedCompletionDate: estimatedCompletionDate !== undefined ? estimatedCompletionDate : issue.estimatedCompletionDate
    })

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Update issue error:', error)
    return c.json({ error: 'Failed to update issue' }, 500)
  }
}

export async function createIssue(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const { title, description, category, location, priority = 'medium', coordinates, photo } = await c.req.json()

    const issueData = {
      title,
      description,
      category,
      location,
      priority,
      reportedBy: user.id,
      reporterName: user.user_metadata?.name || user.email,
      coordinates: coordinates || null,
      photoUrl: photo || null
    }

    const issue = await issueModel.createIssue(issueData)
    const finalIssue = await issueModel.autoAssignIssue(issue)

    return c.json({ success: true, issue: finalIssue })
  } catch (error) {
    console.log('Create issue error:', error)
    return c.json({ error: 'Failed to create issue' }, 500)
  }
}

export async function uploadPhoto(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)

    if (!issue) return c.json({ error: 'Issue not found' }, 404)

    if (issue.reportedBy !== user.id) return c.json({ error: 'Only the issue reporter can upload photos' }, 403)

    const formData = await c.req.formData()
    const file = formData.get('photo') as File

    if (!file) return c.json({ error: 'No photo file provided' }, 400)

    const updatedIssue = await issueModel.uploadPhoto(issueId, file, user.id)

    return c.json({
      success: true,
      issue: updatedIssue,
      message: 'Photo uploaded successfully'
    })
  } catch (error) {
    console.log('Photo upload server error:', error)
    return c.json({ error: 'Internal server error during photo upload' }, 500)
  }
}

export async function getAllIssues(c: Context) {
  try {
    const issues = await issueModel.getAllIssues()
    return c.json({ issues })
  } catch (error) {
    console.log('Get issues error:', error)
    return c.json({ error: 'Failed to fetch issues' }, 500)
  }
}

export async function getIssue(c: Context) {
  try {
    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)

    if (!issue) return c.json({ error: 'Issue not found' }, 404)

    return c.json({ issue })
  } catch (error) {
    console.log('Get single issue error:', error)
    return c.json({ error: 'Failed to fetch issue' }, 500)
  }
}

export async function getUserIssues(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const issues = await issueModel.getUserIssues(user.id)

    return c.json({ issues })
  } catch (error) {
    console.log('Get user issues error:', error)
    return c.json({ error: 'Failed to fetch user issues' }, 500)
  }
}

export async function getTechnicianTasks(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const issues = await issueModel.getTechnicianTasks(user.id)

    return c.json({ issues })
  } catch (error) {
    console.log('Get technician tasks error:', error)
    return c.json({ error: 'Failed to fetch assigned tasks' }, 500)
  }
}

export async function updateStatus(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const { status, adminNote } = await c.req.json()

    const updatedIssue = await issueModel.updateStatus(issueId, status, user.id, adminNote)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Update issue status error:', error)
    return c.json({ error: 'Failed to update issue status' }, 500)
  }
}

export async function getStats(c: Context) {
  try {
    const stats = await issueModel.getStats()
    return c.json({ stats })
  } catch (error) {
    console.log('Get stats error:', error)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
}

export async function getAnalytics(c: Context) {
  try {
    const analytics = await issueModel.getAnalytics()
    return c.json({ analytics })
  } catch (error) {
    console.log('Get analytics error:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
}

export async function assignIssue(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') return c.json({ error: 'Admin access required' }, 403)

    const issueId = c.req.param('id')
    const { technicianId, notes } = await c.req.json()

    const updatedIssue = await issueModel.assignIssue(issueId, technicianId, user.id, notes)

    const notification = await notificationModel.createNotification({
      recipientId: technicianId,
      title: 'New Assignment',
      message: `You have been assigned to issue: ${updatedIssue.title}`,
      type: 'assignment',
      relatedIssueId: issueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email
    })

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    console.log('Assign issue error:', error)
    return c.json({ error: 'Failed to assign issue' }, 500)
  }
}
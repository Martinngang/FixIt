import type { AppContext } from '../utils/types.ts'
import * as issueModel from '../models/issueModel.ts'
import * as notificationModel from '../models/notificationModel.ts'
import * as dispatchModel from '../models/dispatchModel.ts'
import * as inventoryModel from '../models/inventoryModel.ts'
import * as organizationModel from '../models/organizationModel.ts'
import * as smsReportModel from '../models/smsReportModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser, getOrganizationId, getRequestOrganizationId } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from '../utils/errors.ts'
import { extractIssueFromTranscript } from '../utils/gemini.ts'

// Ensures the fetched issue belongs to the caller's tenant (org or public
// city). Returns NotFoundError instead of Forbidden so the existence of
// other tenants' issues is never revealed. The optional userId is the
// marketplace cross-tenant exception: a contractor who has claimed this
// specific issue may access it even though it belongs to another tenant.
function assertIssueAccess(issue: any, organizationId: string | null, userId?: string) {
  if ((issue.organizationId ?? null) === organizationId) return
  if (userId && issue.marketplace?.contractorId === userId) return
  throw new NotFoundError('Issue not found')
}

// In-app counterpart to smsReportModel.notifySmsReporterOfStatusChange - SMS
// reports use the reporter's phone number as reportedBy (not a real user
// id), so they're handled by SMS instead; everyone else gets notified here.
async function notifyReporterOfStatusChange(previousStatus: string, updatedIssue: any, actorId: string) {
  if (updatedIssue.reportedVia === 'sms') return
  if (updatedIssue.status === previousStatus) return
  if (!updatedIssue.reportedBy || updatedIssue.reportedBy === actorId) return

  await notificationModel.createNotification({
    recipientId: updatedIssue.reportedBy,
    title: 'Your issue status changed',
    message: `"${updatedIssue.title}" is now: ${updatedIssue.status.replace(/_/g, ' ')}`,
    type: 'issue_updated',
    relatedIssueId: updatedIssue.id,
    senderId: actorId,
    priority: 'medium',
  })
}

export async function assignToMe(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') throw new ForbiddenError('Technician access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user))
    if (issue.assignedTo) throw new ConflictError('Issue already assigned')

    const updatedIssue = await issueModel.assignToMe(issueId, user.id)

    await notificationModel.createNotification({
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
    return handleError(c, error, 'Failed to assign issue')
  }
}

export async function toggleUpvote(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user))

    const updatedIssue = await issueModel.toggleUpvote(issueId, user.id)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to update upvote')
  }
}

export async function updateIssue(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') throw new ForbiddenError('Technician access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user), user.id)

    if (issue.assignedTo !== user.id) throw new ForbiddenError('Not assigned to this issue')

    const { status, technicianNote, assignedTo, estimatedCompletionDate } = await c.req.json()

    const updatedIssue = await issueModel.updateIssue(issueId, {
      status: status || issue.status,
      technicianNote: technicianNote !== undefined ? technicianNote : issue.technicianNote,
      assignedTo: assignedTo || issue.assignedTo,
      estimatedCompletionDate: estimatedCompletionDate !== undefined ? estimatedCompletionDate : issue.estimatedCompletionDate
    })

    await smsReportModel.notifySmsReporterOfStatusChange(updatedIssue)
    await notifyReporterOfStatusChange(issue.status, updatedIssue, user.id)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to update issue')
  }
}

export async function createIssue(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const organizationId = getOrganizationId(user)

    const { title, description, category, location, priority = 'medium', coordinates, photo } = await c.req.json()

    if (!title || !description || !category || !location) {
      throw new ValidationError('title, description, category, and location are required')
    }

    const validCategories = await organizationModel.getCategoriesForTenant(organizationId)
    if (!validCategories.includes(category)) {
      throw new ValidationError(`category must be one of: ${validCategories.join(', ')}`)
    }

    const issueData = {
      title,
      description,
      category,
      location,
      priority,
      reportedBy: user.id,
      reporterName: user.user_metadata?.name || user.email,
      coordinates: coordinates || null,
      photoUrl: photo || null,
      organizationId
    }

    const issue = await issueModel.createIssue(issueData)
    const finalIssue = await issueModel.autoAssignIssue(issue)
    await issueModel.notifyAdminsOfNewIssue(finalIssue)

    return c.json({ success: true, issue: finalIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to create issue')
  }
}

export async function parseVoiceReport(c: AppContext) {
  try {
    await getAuthenticatedUser(c)

    const { transcript } = await c.req.json()
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      throw new ValidationError('transcript is required')
    }

    const extracted = await extractIssueFromTranscript(transcript.trim())

    return c.json({ success: true, extracted })
  } catch (error) {
    return handleError(c, error, 'Failed to parse voice report')
  }
}

export async function uploadPhoto(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)

    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user))

    if (issue.reportedBy !== user.id) throw new ForbiddenError('Only the issue reporter can upload photos')

    const formData = await c.req.formData()
    const file = formData.get('photo') as File

    if (!file) throw new ValidationError('No photo file provided')

    const updatedIssue = await issueModel.uploadPhoto(issueId, file, user.id)

    return c.json({
      success: true,
      issue: updatedIssue,
      message: 'Photo uploaded successfully'
    })
  } catch (error) {
    return handleError(c, error, 'Internal server error during photo upload')
  }
}

export async function getAllIssues(c: AppContext) {
  try {
    const organizationId = await getRequestOrganizationId(c)
    const issues = await issueModel.getAllIssues(organizationId)
    return c.json({ issues })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch issues')
  }
}

export async function getIssue(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const organizationId = getOrganizationId(user)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)

    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, organizationId, user.id)

    return c.json({ issue })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch issue')
  }
}

export async function getUserIssues(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issues = await issueModel.getUserIssues(user.id)

    return c.json({ issues })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch user issues')
  }
}

export async function getUserImpact(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const impact = await issueModel.getUserImpact(user.id)

    return c.json({ impact })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch impact report')
  }
}

export async function getTechnicianTasks(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issues = await issueModel.getTechnicianTasks(user.id)

    return c.json({ issues })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch assigned tasks')
  }
}

export async function updateStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user), user.id)

    const { status, adminNote } = await c.req.json()

    if (!status) throw new ValidationError('status is required')

    const updatedIssue = await issueModel.updateStatus(issueId, status, user.id, adminNote)

    await smsReportModel.notifySmsReporterOfStatusChange(updatedIssue)
    await notifyReporterOfStatusChange(issue.status, updatedIssue, user.id)

    return c.json({ success: true, issue: updatedIssue })
  } catch (error) {
    return handleError(c, error, 'Failed to update issue status')
  }
}

export async function getStats(c: AppContext) {
  try {
    const organizationId = await getRequestOrganizationId(c)
    const stats = await issueModel.getStats(organizationId)
    return c.json({ stats })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch statistics')
  }
}

export async function getAnalytics(c: AppContext) {
  try {
    const organizationId = await getRequestOrganizationId(c)
    const analytics = await issueModel.getAnalytics(organizationId)
    return c.json({ analytics })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch analytics')
  }
}

export async function getHotspots(c: AppContext) {
  try {
    const organizationId = await getRequestOrganizationId(c)
    const hotspots = await issueModel.getHotspots(organizationId)
    return c.json({ hotspots })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch hotspots')
  }
}

export async function getSuggestedTechnicians(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user))

    const suggestions = await dispatchModel.suggestTechnicians(issueId)

    return c.json({ suggestions })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch suggested technicians')
  }
}

export async function requestParts(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'technician') throw new ForbiddenError('Technician access required')

    const issueId = c.req.param('id')
    const { itemId, quantity } = await c.req.json()

    if (!itemId) throw new ValidationError('itemId is required')

    const result = await inventoryModel.requestPartsForIssue(
      issueId,
      itemId,
      Number(quantity),
      user.id,
      user.user_metadata?.name || user.email,
      getOrganizationId(user)
    )

    return c.json({ success: true, ...result })
  } catch (error) {
    return handleError(c, error, 'Failed to request parts')
  }
}

export async function assignIssue(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const issueId = c.req.param('id')
    const issue = await issueModel.getIssue(issueId)
    if (!issue) throw new NotFoundError('Issue not found')
    assertIssueAccess(issue, getOrganizationId(user))

    const { technicianId, notes } = await c.req.json()

    if (!technicianId) throw new ValidationError('technicianId is required')

    const updatedIssue = await issueModel.assignIssue(issueId, technicianId, user.id, notes)

    await notificationModel.createNotification({
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
    return handleError(c, error, 'Failed to assign issue')
  }
}

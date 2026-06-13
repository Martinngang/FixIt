import type { AppContext } from '../utils/types.ts'
import * as ideaModel from '../models/ideaModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

function isStaffRole(role: string) {
  return role === 'admin' || role === 'technician'
}

export async function getAllIdeas(c: AppContext) {
  try {
    const status = c.req.query('status') || undefined
    const category = c.req.query('category') || undefined
    const ideas = await ideaModel.getAllIdeas({ status, category })
    return c.json({ ideas })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch ideas')
  }
}

export async function getIdea(c: AppContext) {
  try {
    const idea = await ideaModel.getIdea(c.req.param('id'))
    if (!idea) throw new NotFoundError('Idea not found')
    return c.json({ idea })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch idea')
  }
}

export async function createIdea(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const { title, description, category } = await c.req.json()

    const idea = await ideaModel.createIdea({
      title,
      description,
      category,
      createdBy: user.id,
      createdByName: user.user_metadata?.name || user.email,
    })

    return c.json({ success: true, idea })
  } catch (error) {
    return handleError(c, error, 'Failed to create idea')
  }
}

export async function toggleVote(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const idea = await ideaModel.toggleVote(c.req.param('id'), user.id)
    return c.json({ success: true, idea })
  } catch (error) {
    return handleError(c, error, 'Failed to vote on idea')
  }
}

export async function updateIdeaStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const role = getEffectiveUserRole(user, c.req)
    if (!isStaffRole(role)) throw new ForbiddenError('Only local authorities can update idea status')

    const { status } = await c.req.json()
    if (!status) throw new ValidationError('status is required')

    const idea = await ideaModel.updateIdeaStatus(c.req.param('id'), status)
    return c.json({ success: true, idea })
  } catch (error) {
    return handleError(c, error, 'Failed to update idea status')
  }
}

export async function deleteIdea(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const role = getEffectiveUserRole(user, c.req)

    await ideaModel.deleteIdea(c.req.param('id'), user.id, isStaffRole(role))
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete idea')
  }
}

export async function getComments(c: AppContext) {
  try {
    const comments = await ideaModel.getIdeaComments(c.req.param('id'))
    return c.json({ comments })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch comments')
  }
}

export async function createComment(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const { text } = await c.req.json()
    if (!text) throw new ValidationError('text is required')

    const comment = await ideaModel.createIdeaComment(c.req.param('id'), user.id, user.user_metadata?.name || user.email, text)
    return c.json({ success: true, comment })
  } catch (error) {
    return handleError(c, error, 'Failed to add comment')
  }
}

export async function deleteComment(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const role = getEffectiveUserRole(user, c.req)

    await ideaModel.deleteIdeaComment(c.req.param('id'), c.req.param('commentId'), user.id, role === 'admin')
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete comment')
  }
}

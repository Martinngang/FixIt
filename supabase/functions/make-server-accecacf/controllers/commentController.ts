import type { AppContext } from '../utils/types.ts'
import * as commentModel from '../models/commentModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ValidationError } from '../utils/errors.ts'

export async function getComments(c: AppContext) {
  try {
    const issueId = c.req.param('id')
    const comments = await commentModel.getComments(issueId)
    return c.json({ comments })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch comments')
  }
}

export async function createComment(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const issueId = c.req.param('id')
    const { text } = await c.req.json()

    if (!text) throw new ValidationError('text is required')

    const comment = await commentModel.createComment(issueId, user.id, user.user_metadata?.name || user.email, text)
    return c.json({ success: true, comment })
  } catch (error) {
    return handleError(c, error, 'Failed to add comment')
  }
}

export async function deleteComment(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    const issueId = c.req.param('id')
    const commentId = c.req.param('commentId')

    await commentModel.deleteComment(issueId, commentId, user.id, userRole === 'admin')
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete comment')
  }
}

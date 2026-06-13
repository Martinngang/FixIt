import * as kv from '../kv_store.tsx'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.ts'
import { getIssue } from './issueModel.ts'

const MAX_COMMENT_LENGTH = 1000

export async function getComments(issueId: string) {
  const comments = await kv.getByPrefix(`comment:${issueId}:`)
  return comments.sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export async function createComment(issueId: string, userId: string, userName: string, text: string) {
  const trimmed = (text || '').trim()
  if (!trimmed) throw new ValidationError('Comment text is required')
  if (trimmed.length > MAX_COMMENT_LENGTH) throw new ValidationError(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`)

  const issue = await getIssue(issueId)
  if (!issue) throw new NotFoundError('Issue not found')

  const comment = {
    id: crypto.randomUUID(),
    issueId,
    userId,
    userName,
    text: trimmed,
    createdAt: new Date().toISOString(),
  }

  await kv.set(`comment:${issueId}:${comment.id}`, comment)
  return comment
}

export async function deleteComment(issueId: string, commentId: string, userId: string, isModerator: boolean) {
  const comment = await kv.get(`comment:${issueId}:${commentId}`)
  if (!comment) throw new NotFoundError('Comment not found')
  if (comment.userId !== userId && !isModerator) throw new ForbiddenError('Not allowed to delete this comment')

  await kv.del(`comment:${issueId}:${commentId}`)
}

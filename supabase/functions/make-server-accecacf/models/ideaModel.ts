import * as kv from '../kv_store.tsx'
import * as notificationModel from './notificationModel.ts'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.ts'

export const IDEA_STATUSES = ['open', 'under_review', 'planned', 'in_progress', 'completed', 'rejected'] as const
const MAX_COMMENT_LENGTH = 1000

export async function createIdea({
  title,
  description,
  category,
  createdBy,
  createdByName,
}: {
  title: string
  description: string
  category?: string
  createdBy: string
  createdByName: string
}) {
  const trimmedTitle = (title || '').trim()
  const trimmedDescription = (description || '').trim()
  if (!trimmedTitle) throw new ValidationError('Title is required')
  if (!trimmedDescription) throw new ValidationError('Description is required')

  const idea = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    description: trimmedDescription,
    category: category || 'Other',
    status: 'open' as typeof IDEA_STATUSES[number],
    upvotes: 0,
    upvotedBy: [] as string[],
    createdBy,
    createdByName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`idea:${idea.id}`, idea)
  return idea
}

export async function getAllIdeas({ status, category }: { status?: string; category?: string } = {}) {
  let ideas = await kv.getByPrefix('idea:')

  if (status) ideas = ideas.filter(idea => idea.status === status)
  if (category) ideas = ideas.filter(idea => idea.category === category)

  return ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getIdea(ideaId: string) {
  return await kv.get(`idea:${ideaId}`)
}

export async function toggleVote(ideaId: string, userId: string) {
  const idea = await kv.get(`idea:${ideaId}`)
  if (!idea) throw new NotFoundError('Idea not found')

  const upvotedBy: string[] = idea.upvotedBy || []
  const hasVoted = upvotedBy.includes(userId)

  const updatedIdea = {
    ...idea,
    upvotedBy: hasVoted ? upvotedBy.filter((id: string) => id !== userId) : [...upvotedBy, userId],
    upvotes: hasVoted ? Math.max(0, (idea.upvotes || 0) - 1) : (idea.upvotes || 0) + 1,
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`idea:${ideaId}`, updatedIdea)
  return updatedIdea
}

export async function updateIdeaStatus(ideaId: string, status: string) {
  if (!IDEA_STATUSES.includes(status as typeof IDEA_STATUSES[number])) {
    throw new ValidationError(`status must be one of: ${IDEA_STATUSES.join(', ')}`)
  }

  const idea = await kv.get(`idea:${ideaId}`)
  if (!idea) throw new NotFoundError('Idea not found')

  const updatedIdea = { ...idea, status, updatedAt: new Date().toISOString() }
  await kv.set(`idea:${ideaId}`, updatedIdea)

  if (idea.createdBy) {
    await notificationModel.createNotification({
      recipientId: idea.createdBy,
      title: 'Your idea status changed',
      message: `"${idea.title}" is now: ${status.replace(/_/g, ' ')}`,
      type: 'info',
      priority: 'medium',
    })
  }

  return updatedIdea
}

export async function deleteIdea(ideaId: string, userId: string, isModerator: boolean) {
  const idea = await kv.get(`idea:${ideaId}`)
  if (!idea) throw new NotFoundError('Idea not found')
  if (idea.createdBy !== userId && !isModerator) throw new ForbiddenError('Not allowed to delete this idea')

  await kv.del(`idea:${ideaId}`)

  const comments = await kv.getByPrefix(`idea_comment:${ideaId}:`)
  if (comments.length > 0) {
    await kv.mdel(comments.map((comment: any) => `idea_comment:${ideaId}:${comment.id}`))
  }
}

export async function getIdeaComments(ideaId: string) {
  const comments = await kv.getByPrefix(`idea_comment:${ideaId}:`)
  return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function createIdeaComment(ideaId: string, userId: string, userName: string, text: string) {
  const trimmed = (text || '').trim()
  if (!trimmed) throw new ValidationError('Comment text is required')
  if (trimmed.length > MAX_COMMENT_LENGTH) throw new ValidationError(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`)

  const idea = await kv.get(`idea:${ideaId}`)
  if (!idea) throw new NotFoundError('Idea not found')

  const comment = {
    id: crypto.randomUUID(),
    ideaId,
    userId,
    userName,
    text: trimmed,
    createdAt: new Date().toISOString(),
  }

  await kv.set(`idea_comment:${ideaId}:${comment.id}`, comment)

  if (idea.createdBy && idea.createdBy !== userId) {
    await notificationModel.createNotification({
      recipientId: idea.createdBy,
      title: 'New comment on your idea',
      message: `${userName} commented on "${idea.title}"`,
      type: 'info',
      senderId: userId,
      senderName: userName,
      priority: 'low',
    })
  }

  return comment
}

export async function deleteIdeaComment(ideaId: string, commentId: string, userId: string, isModerator: boolean) {
  const comment = await kv.get(`idea_comment:${ideaId}:${commentId}`)
  if (!comment) throw new NotFoundError('Comment not found')
  if (comment.userId !== userId && !isModerator) throw new ForbiddenError('Not allowed to delete this comment')

  await kv.del(`idea_comment:${ideaId}:${commentId}`)
}

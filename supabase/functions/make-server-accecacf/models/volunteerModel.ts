import * as kv from '../kv_store.tsx'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.ts'

export const VOLUNTEER_TASK_STATUSES = ['open', 'completed', 'cancelled'] as const

export async function createTask({
  title,
  description,
  category,
  location,
  coordinates,
  maxVolunteers,
  createdBy,
  createdByName,
}: {
  title: string
  description: string
  category?: string
  location: string
  coordinates?: { lat: number; lng: number } | null
  maxVolunteers?: number | null
  createdBy: string
  createdByName: string
}) {
  const trimmedTitle = (title || '').trim()
  const trimmedDescription = (description || '').trim()
  if (!trimmedTitle) throw new ValidationError('Title is required')
  if (!trimmedDescription) throw new ValidationError('Description is required')
  if (!(location || '').trim()) throw new ValidationError('Location is required')

  const task = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    description: trimmedDescription,
    category: category || 'Other',
    location: location.trim(),
    coordinates: coordinates ?? null,
    maxVolunteers: maxVolunteers ?? null,
    status: 'open' as typeof VOLUNTEER_TASK_STATUSES[number],
    volunteers: [] as Array<{ userId: string; userName: string; joinedAt: string }>,
    createdBy,
    createdByName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`volunteer_task:${task.id}`, task)
  return task
}

export async function getAllTasks({ status, category }: { status?: string; category?: string } = {}) {
  let tasks = await kv.getByPrefix('volunteer_task:')

  if (status) tasks = tasks.filter(task => task.status === status)
  if (category) tasks = tasks.filter(task => task.category === category)

  return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getTask(taskId: string) {
  return await kv.get(`volunteer_task:${taskId}`)
}

export async function joinTask(taskId: string, userId: string, userName: string) {
  const task = await kv.get(`volunteer_task:${taskId}`)
  if (!task) throw new NotFoundError('Volunteer task not found')
  if (task.status !== 'open') throw new ConflictError('This task is no longer open for volunteers')

  const volunteers: Array<{ userId: string; userName: string; joinedAt: string }> = task.volunteers || []
  if (volunteers.some(v => v.userId === userId)) throw new ConflictError('You have already joined this task')
  if (task.maxVolunteers && volunteers.length >= task.maxVolunteers) {
    throw new ConflictError('This task already has enough volunteers')
  }

  const updatedTask = {
    ...task,
    volunteers: [...volunteers, { userId, userName, joinedAt: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`volunteer_task:${taskId}`, updatedTask)
  return updatedTask
}

export async function leaveTask(taskId: string, userId: string) {
  const task = await kv.get(`volunteer_task:${taskId}`)
  if (!task) throw new NotFoundError('Volunteer task not found')

  const volunteers: Array<{ userId: string; userName: string; joinedAt: string }> = task.volunteers || []
  if (!volunteers.some(v => v.userId === userId)) throw new ConflictError('You have not joined this task')

  const updatedTask = {
    ...task,
    volunteers: volunteers.filter(v => v.userId !== userId),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`volunteer_task:${taskId}`, updatedTask)
  return updatedTask
}

export async function updateTaskStatus(taskId: string, status: string) {
  if (!VOLUNTEER_TASK_STATUSES.includes(status as typeof VOLUNTEER_TASK_STATUSES[number])) {
    throw new ValidationError(`status must be one of: ${VOLUNTEER_TASK_STATUSES.join(', ')}`)
  }

  const task = await kv.get(`volunteer_task:${taskId}`)
  if (!task) throw new NotFoundError('Volunteer task not found')

  const updatedTask = { ...task, status, updatedAt: new Date().toISOString() }
  await kv.set(`volunteer_task:${taskId}`, updatedTask)
  return updatedTask
}

export async function deleteTask(taskId: string) {
  const task = await kv.get(`volunteer_task:${taskId}`)
  if (!task) throw new NotFoundError('Volunteer task not found')
  await kv.del(`volunteer_task:${taskId}`)
}

export async function getUserTasks(userId: string) {
  const tasks = await kv.getByPrefix('volunteer_task:')
  return tasks
    .filter(task => (task.volunteers || []).some((v: { userId: string }) => v.userId === userId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

// Feeds the reputation system - citizens earn points for volunteer work that
// gets marked completed by staff, on top of points earned from reporting.
export async function getCompletedTaskCount(userId: string) {
  const tasks = await getUserTasks(userId)
  return tasks.filter(task => task.status === 'completed').length
}

import type { AppContext } from '../utils/types.ts'
import * as volunteerModel from '../models/volunteerModel.ts'
import * as notificationModel from '../models/notificationModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

function requireStaff(role: string) {
  if (role !== 'admin' && role !== 'technician') {
    throw new ForbiddenError('Only local authorities can manage volunteer tasks')
  }
}

export async function getAllTasks(c: AppContext) {
  try {
    const status = c.req.query('status') || undefined
    const category = c.req.query('category') || undefined
    const tasks = await volunteerModel.getAllTasks({ status, category })
    return c.json({ tasks })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch volunteer tasks')
  }
}

export async function getTask(c: AppContext) {
  try {
    const task = await volunteerModel.getTask(c.req.param('id'))
    if (!task) throw new NotFoundError('Volunteer task not found')
    return c.json({ task })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch volunteer task')
  }
}

export async function createTask(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const { title, description, category, location, coordinates, maxVolunteers } = await c.req.json()

    const task = await volunteerModel.createTask({
      title,
      description,
      category,
      location,
      coordinates,
      maxVolunteers,
      createdBy: user.id,
      createdByName: user.user_metadata?.name || user.email,
    })

    return c.json({ success: true, task })
  } catch (error) {
    return handleError(c, error, 'Failed to create volunteer task')
  }
}

export async function joinTask(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const task = await volunteerModel.joinTask(c.req.param('id'), user.id, user.user_metadata?.name || user.email)
    return c.json({ success: true, task })
  } catch (error) {
    return handleError(c, error, 'Failed to join volunteer task')
  }
}

export async function leaveTask(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const task = await volunteerModel.leaveTask(c.req.param('id'), user.id)
    return c.json({ success: true, task })
  } catch (error) {
    return handleError(c, error, 'Failed to leave volunteer task')
  }
}

export async function updateTaskStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const { status } = await c.req.json()
    if (!status) throw new ValidationError('status is required')

    const task = await volunteerModel.updateTaskStatus(c.req.param('id'), status)

    if (status === 'completed') {
      for (const volunteer of task.volunteers || []) {
        await notificationModel.createNotification({
          recipientId: volunteer.userId,
          title: 'Volunteer Task Completed',
          message: `Thanks for helping out with "${task.title}"! You've earned reputation points for your contribution.`,
          type: 'volunteer_task_completed',
          senderId: user.id,
          senderName: user.user_metadata?.name || user.email,
        })
      }
    }

    return c.json({ success: true, task })
  } catch (error) {
    return handleError(c, error, 'Failed to update volunteer task')
  }
}

export async function deleteTask(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    await volunteerModel.deleteTask(c.req.param('id'))
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete volunteer task')
  }
}

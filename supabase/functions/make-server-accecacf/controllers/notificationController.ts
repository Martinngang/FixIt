import type { AppContext } from '../utils/types.ts'
import * as notificationModel from '../models/notificationModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ForbiddenError, ValidationError } from '../utils/errors.ts'

export async function getNotifications(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const notifications = await notificationModel.getNotifications(user.id)
    return c.json({ notifications })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch notifications')
  }
}

export async function sendNotification(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const { recipientId, title, message, type = 'info', priority = 'medium', relatedIssueId } = await c.req.json()

    if (!recipientId || !title || !message) {
      throw new ValidationError('recipientId, title, and message are required')
    }

    const notifications = await notificationModel.sendNotification({
      recipientId,
      title,
      message,
      type,
      priority,
      relatedIssueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email
    })

    return c.json({ success: true, notifications })
  } catch (error) {
    return handleError(c, error, 'Failed to send notification')
  }
}

export async function getSentNotifications(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const userRole = getEffectiveUserRole(user, c.req)
    if (userRole !== 'admin') throw new ForbiddenError('Admin access required')

    const broadcasts = await notificationModel.getSentNotifications(user.id)
    return c.json({ broadcasts })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch sent notification history')
  }
}

export async function markAsRead(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const notificationId = c.req.param('id')
    const updatedNotification = await notificationModel.markAsRead(user.id, notificationId)

    return c.json({ success: true, notification: updatedNotification })
  } catch (error) {
    return handleError(c, error, 'Failed to mark notification as read')
  }
}

export async function markAsUnread(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const notificationId = c.req.param('id')
    const updatedNotification = await notificationModel.markAsUnread(user.id, notificationId)

    return c.json({ success: true, notification: updatedNotification })
  } catch (error) {
    return handleError(c, error, 'Failed to mark notification as unread')
  }
}

export async function deleteNotification(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    const notificationId = c.req.param('id')
    await notificationModel.deleteNotification(user.id, notificationId)

    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete notification')
  }
}

export async function markAllAsRead(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)

    await notificationModel.markAllAsRead(user.id)

    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to mark all notifications as read')
  }
}

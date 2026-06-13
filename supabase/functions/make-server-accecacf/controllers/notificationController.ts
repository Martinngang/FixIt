import type { AppContext } from '../utils/types.ts'
import * as notificationModel from '../models/notificationModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ValidationError } from '../utils/errors.ts'

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

    const { recipientId, title, message, type = 'info', relatedIssueId } = await c.req.json()

    if (!recipientId || !title || !message) {
      throw new ValidationError('recipientId, title, and message are required')
    }

    const notifications = await notificationModel.sendNotification({
      recipientId,
      title,
      message,
      type,
      relatedIssueId,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email
    })

    return c.json({ success: true, notifications })
  } catch (error) {
    return handleError(c, error, 'Failed to send notification')
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

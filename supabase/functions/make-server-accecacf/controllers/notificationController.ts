import { Context } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as notificationModel from '../models/notificationModel.ts'

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

export async function getNotifications(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const notifications = await notificationModel.getNotifications(user.id)
    return c.json({ notifications })
  } catch (error) {
    console.log('Get notifications error:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
}

export async function sendNotification(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const { recipientId, title, message, type = 'info', relatedIssueId } = await c.req.json()

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
    console.log('Send notification error:', error)
    return c.json({ error: 'Failed to send notification' }, 500)
  }
}

export async function markAsRead(c: Context) {
  try {
    const user = await getAuthenticatedUser(c)

    const notificationId = c.req.param('id')
    const updatedNotification = await notificationModel.markAsRead(user.id, notificationId)

    return c.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.log('Mark notification read error:', error)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
}
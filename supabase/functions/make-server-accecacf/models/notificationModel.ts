import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from '../kv_store.tsx'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function getNotifications(userId: string) {
  const notifications = await kv.getByPrefix(`notification:${userId}:`)
  return notifications.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function sendNotification({
  recipientId,
  title,
  message,
  type = 'info',
  relatedIssueId,
  senderId,
  senderName
}: {
  recipientId: string
  title: string
  message: string
  type?: string
  relatedIssueId?: string
  senderId: string
  senderName: string
}) {
  let recipients: string[] = []

  if (recipientId === 'all' || recipientId === 'technicians' || recipientId === 'citizens') {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers({
      page: 1, perPage: 1000
    })
    if (error) throw new Error('Failed to fetch users')
    const users = authUsers?.users?.map(authUser => ({
      id: authUser.id,
      role: authUser.user_metadata?.role || 'citizen'
    })) || []
    if (recipientId === 'all') {
      recipients = users.map(u => u.id)
    } else if (recipientId === 'technicians') {
      recipients = users.filter(u => u.role === 'technician').map(u => u.id)
    } else if (recipientId === 'citizens') {
      recipients = users.filter(u => u.role === 'citizen').map(u => u.id)
    }
  } else {
    recipients = [recipientId]
  }

  const notifications = []
  for (const recId of recipients) {
    const notification = {
      id: crypto.randomUUID(),
      recipientId: recId,
      title,
      message,
      type,
      relatedIssueId: relatedIssueId || null,
      senderId,
      senderName,
      createdAt: new Date().toISOString(),
      read: false,
      priority: 'medium' as 'low' | 'medium' | 'high'
    }
    await kv.set(`notification:${recId}:${notification.id}`, notification)
    notifications.push(notification)
  }

  return notifications
}

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await kv.get(`notification:${userId}:${notificationId}`)
  if (!notification) throw new Error('Notification not found')

  const updatedNotification = {
    ...notification,
    read: true,
    readAt: new Date().toISOString()
  }

  await kv.set(`notification:${userId}:${notificationId}`, updatedNotification)
  return updatedNotification
}

export async function createNotification(notificationData: any) {
  const notification = {
    id: crypto.randomUUID(),
    ...notificationData,
    createdAt: new Date().toISOString(),
    read: false
  }

  await kv.set(`notification:${notification.recipientId}:${notification.id}`, notification)
  return notification
}
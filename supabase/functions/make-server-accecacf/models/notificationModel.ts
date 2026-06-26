import { createClient } from 'npm:@supabase/supabase-js@2'
import { NotFoundError } from '../utils/errors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Maps a `notifications` table row (snake_case) to the camelCase shape the
// frontend and the rest of the backend already expect - keeping this
// mapping isolated here means no caller had to change when this model
// moved off the generic kv_store onto a real table.
function toClientShape(row: any) {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    title: row.title,
    message: row.message,
    type: row.type,
    relatedIssueId: row.related_issue_id ?? undefined,
    senderId: row.sender_id ?? undefined,
    senderName: row.sender_name ?? undefined,
    priority: row.priority,
    read: row.read,
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  }
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toClientShape)
}

export async function sendNotification({
  recipientId,
  title,
  message,
  type = 'info',
  priority = 'medium',
  relatedIssueId,
  senderId,
  senderName
}: {
  recipientId: string
  title: string
  message: string
  type?: string
  priority?: string
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

  const rows = recipients.map((recId) => ({
    recipient_id: recId,
    title,
    message,
    type,
    priority,
    related_issue_id: relatedIssueId || null,
    sender_id: senderId,
    sender_name: senderName,
  }))

  const notifications = rows.length === 0 ? [] : await (async () => {
    const { data, error } = await supabase.from('notifications').insert(rows).select()
    if (error) throw error
    return (data || []).map(toClientShape)
  })()

  // One audit row per send action, regardless of how many recipients it
  // fanned out to - this is what the admin's "sent history" view reads.
  const { error: broadcastError } = await supabase.from('notification_broadcasts').insert({
    sender_id: senderId,
    sender_name: senderName,
    title,
    message,
    type,
    priority,
    target: recipientId,
    recipient_count: recipients.length,
  })
  if (broadcastError) throw broadcastError

  return notifications
}

export async function getSentNotifications(senderId: string) {
  const { data, error } = await supabase
    .from('notification_broadcasts')
    .select('*')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    priority: row.priority,
    target: row.target,
    recipientCount: row.recipient_count,
    createdAt: row.created_at,
  }))
}

export async function markAsRead(userId: string, notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new NotFoundError('Notification not found')
  return toClientShape(data)
}

export async function markAsUnread(userId: string, notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: false, read_at: null })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new NotFoundError('Notification not found')
  return toClientShape(data)
}

export async function deleteNotification(userId: string, notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new NotFoundError('Notification not found')
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('read', false)

  if (error) throw error
}

export async function createNotification(notificationData: any) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: notificationData.recipientId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      related_issue_id: notificationData.relatedIssueId || null,
      sender_id: notificationData.senderId || null,
      sender_name: notificationData.senderName || null,
      priority: notificationData.priority || 'medium',
    })
    .select()
    .single()

  if (error) throw error
  return toClientShape(data)
}

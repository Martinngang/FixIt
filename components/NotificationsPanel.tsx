import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Button } from "./ui/button.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
import { EmptyState } from "./ui/empty-state.tsx"
import { StatusBadge } from "./ui/status-badge.tsx"
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Wrench,
  Settings,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"
import { supabase } from "../utils/supabase/client"

interface Notification {
  id: string
  type: 'issue_assigned' | 'issue_completed' | 'issue_updated' | 'task_assigned' | 'task_completed' | 'system' | 'info' | 'assignment'
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedIssueId?: string
  senderId?: string
  senderName?: string
  priority: 'low' | 'medium' | 'high'
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'issue_assigned':
    case 'task_assigned':
      return <Wrench className="h-5 w-5 text-info" />
    case 'issue_completed':
    case 'task_completed':
      return <CheckCircle className="h-5 w-5 text-success" />
    case 'issue_updated':
      return <AlertCircle className="h-5 w-5 text-warning" />
    case 'system':
      return <Settings className="h-5 w-5 text-muted-foreground" />
    default:
      return <Bell className="h-5 w-5 text-info" />
  }
}

const translations = {
  en: {
    notifications: 'Notifications',
    notificationCenter: 'Notification Center',
    allNotifications: 'All',
    unreadNotifications: 'Unread',
    taskNotifications: 'Tasks',
    systemNotifications: 'System',
    markAsRead: 'Mark as read',
    markAsUnread: 'Mark as unread',
    deleteNotification: 'Delete',
    markAllAsRead: 'Mark all as read',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',
    noNotificationsDesc: 'You\'re all caught up!',
    noUnreadNotifications: 'No unread notifications',
    noUnreadNotificationsDesc: 'All notifications have been read',
    priority: 'Priority',
    from: 'From',
    relatedTo: 'Related to issue',
    viewIssue: 'View Issue',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
    loading: 'Loading notifications...',
    error: 'Failed to load notifications',
    refresh: 'Retry',
    issueAssigned: 'Issue Assigned',
    taskAssigned: 'Task Assigned',
    issueCompleted: 'Issue Completed',
    taskCompleted: 'Task Completed',
    issueUpdated: 'Issue Updated',
    systemMessage: 'System Message'
  },
  fr: {
    notifications: 'Notifications',
    notificationCenter: 'Centre de notifications',
    allNotifications: 'Toutes',
    unreadNotifications: 'Non lues',
    taskNotifications: 'Tâches',
    systemNotifications: 'Système',
    markAsRead: 'Marquer comme lu',
    markAsUnread: 'Marquer comme non lu',
    deleteNotification: 'Supprimer',
    markAllAsRead: 'Tout marquer comme lu',
    clearAll: 'Tout effacer',
    noNotifications: 'Aucune notification',
    noNotificationsDesc: 'Vous êtes à jour!',
    noUnreadNotifications: 'Aucune notification non lue',
    noUnreadNotificationsDesc: 'Toutes les notifications ont été lues',
    priority: 'Priorité',
    from: 'De',
    relatedTo: 'Lié au problème',
    viewIssue: 'Voir le problème',
    justNow: 'À l\'instant',
    minutesAgo: 'minutes',
    hoursAgo: 'heures',
    daysAgo: 'jours',
    weeksAgo: 'semaines',
    loading: 'Chargement des notifications...',
    error: 'Échec du chargement des notifications',
    refresh: 'Réessayer',
    issueAssigned: 'Problème assigné',
    taskAssigned: 'Tâche assignée',
    issueCompleted: 'Problème terminé',
    taskCompleted: 'Tâche terminée',
    issueUpdated: 'Problème mis à jour',
    systemMessage: 'Message système'
  }
}

export function NotificationsPanel({ 
  session, 
  language = 'en', 
  userRole,
  tempRole 
}: { 
  session: any; 
  language?: 'en' | 'fr';
  userRole: string;
  tempRole?: string | null;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const t = translations[language]

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError('')

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token}`
      };
      
      if (tempRole) {
        headers['X-Temp-Role'] = tempRole;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications`, {
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err: any) {
      console.error('Fetch notifications error:', err)
      setError(err.message || t.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.access_token) return

    fetchNotifications()
  }, [session])

  // Realtime subscription - the `notifications` table is RLS-scoped to
  // auth.uid() = recipient_id, and this filter narrows the Postgres
  // replication stream to just this user's rows. Each event is applied
  // directly to local state, so there's no polling and no refetch.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    const toClientShape = (row: any): Notification => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      read: row.read,
      createdAt: row.created_at,
      relatedIssueId: row.related_issue_id ?? undefined,
      senderId: row.sender_id ?? undefined,
      senderName: row.sender_name ?? undefined,
      priority: row.priority,
    })

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}`
      }, (payload: any) => {
        setNotifications((prev) => [toClientShape(payload.new), ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}`
      }, (payload: any) => {
        const updated = toClientShape(payload.new)
        setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}`
      }, (payload: any) => {
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session?.user?.id])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token}`
      };
      if (tempRole) {
        headers['X-Temp-Role'] = tempRole;
      }

      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/${notificationId}/unread`, {
        method: 'PATCH', // Using PATCH for unread is more conventional than PUT
        headers
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      )
    } catch (err) {
      console.error('Mark as unread error:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Delete notification error:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token}`
      };
      if (tempRole) {
        headers['X-Temp-Role'] = tempRole;
      }

      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/mark-all-read`, {
        method: 'PATCH', // Using PATCH is more conventional
        headers
      })

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Mark all as read error:', err)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return t.justNow
    if (diffInMinutes < 60) return `${diffInMinutes} ${t.minutesAgo}`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ${t.hoursAgo}`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ${t.daysAgo}`
    return `${Math.floor(diffInMinutes / 10080)} ${t.weeksAgo}`
  }

  const filterNotifications = (notifications: Notification[], filter: string) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'tasks':
        return notifications.filter(n =>
          n.type === 'task_assigned' ||
          n.type === 'task_completed' ||
          n.type === 'issue_assigned' ||
          n.type === 'assignment'
        )
      case 'system':
        return notifications.filter(n => n.type === 'system' || n.type === 'info')
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(notifications, activeTab)
  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-fade-in">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4" />
            {t.refresh}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-info" />
                <span>{t.notificationCenter}</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stay updated with the latest activities and updates
              </CardDescription>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="self-start sm:self-auto"
              >
                {t.markAllAsRead}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
              <TabsTrigger value="all" className="gap-1.5 whitespace-nowrap">
                <span>{t.allNotifications}</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-1.5 whitespace-nowrap">
                <span>{t.unreadNotifications}</span>
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
              </TabsTrigger>
              {(userRole === 'technician' || userRole === 'admin') && (
                <TabsTrigger value="tasks" className="gap-1.5 whitespace-nowrap">
                  <Wrench className="h-4 w-4" />
                  <span>{t.taskNotifications}</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="system" className="gap-1.5 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                <span>{t.systemNotifications}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title={activeTab === 'unread' ? t.noUnreadNotifications : t.noNotifications}
                  description={activeTab === 'unread' ? t.noUnreadNotificationsDesc : t.noNotificationsDesc}
                />
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        notification.read ? 'border-border' : 'bg-info/10 border-info/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-foreground">
                                  {notification.title}
                                </h4>
                                <StatusBadge kind="priority" value={notification.priority} label={notification.priority} />
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-info rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{getTimeAgo(notification.createdAt)}</span>
                                </div>
                                {notification.senderName && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{t.from} {notification.senderName}</span>
                                  </div>
                                )}
                                {notification.relatedIssueId && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{t.relatedTo} #{notification.relatedIssueId.slice(-6)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {notification.relatedIssueId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title={t.viewIssue}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                title={notification.read ? t.markAsUnread : t.markAsRead}
                              >
                                {notification.read ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteNotification(notification.id)}
                                title={t.deleteNotification}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
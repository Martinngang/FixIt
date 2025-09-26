import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Button } from "./ui/button.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
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
  Trash2
} from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"

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
      return <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    case 'issue_completed':
    case 'task_completed':
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    case 'issue_updated':
      return <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
    case 'system':
      return <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    default:
      return <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
    case 'low':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
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
    if (session?.access_token) {
      fetchNotifications()
    }
  }, [session])

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

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>{t.notificationCenter}</span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Stay updated with the latest activities and updates
                      </CardDescription>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={markAllAsRead}
                          disabled={unreadCount === 0}
                          className="bg-background border-border text-foreground hover:bg-muted"
                        >
                          {t.markAllAsRead}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="all" className="flex items-center space-x-2">
                        <span>{t.allNotifications}</span>
                        <Badge variant="outline">{notifications.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="unread" className="flex items-center space-x-2">
                        <span>{t.unreadNotifications}</span>
                        {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
                      </TabsTrigger>
                      {(userRole === 'technician' || userRole === 'admin') && (
                        <TabsTrigger value="tasks" className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4" />
                          <span>{t.taskNotifications}</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="system" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>{t.systemNotifications}</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                      {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {activeTab === 'unread' ? t.noUnreadNotifications : t.noNotifications}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {activeTab === 'unread' ? t.noUnreadNotificationsDesc : t.noNotificationsDesc}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-lg border ${
                                notification.read
                                  ? 'bg-background border-border'
                                  : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                              } transition-colors`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="text-sm font-medium text-foreground">
                                          {notification.title}
                                        </h4>
                                        <Badge className={getPriorityColor(notification.priority)}>
                                          {notification.priority}
                                        </Badge>
                                        {!notification.read && (
                                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{getTimeAgo(notification.createdAt)}</span>
                                        </div>
                                        {notification.senderName && (
                                          <div className="flex items-center space-x-1">
                                            <User className="h-3 w-3" />
                                            <span>{t.from} {notification.senderName}</span>
                                          </div>
                                        )}
                                        {notification.relatedIssueId && (
                                          <div className="flex items-center space-x-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{t.relatedTo} #{notification.relatedIssueId.slice(-6)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-4">
                                      {notification.relatedIssueId && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 bg-background border-border text-foreground hover:bg-muted"
                                          title={t.viewIssue}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-background border-border text-foreground hover:bg-muted"
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
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
          )}
        </div>
      </div>
    </>
  )
}
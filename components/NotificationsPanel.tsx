import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
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
import { projectId } from '../utils/supabase/info'

interface Notification {
  id: string
  type: 'issue_assigned' | 'issue_completed' | 'issue_updated' | 'task_assigned' | 'task_completed' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedIssueId?: string
  fromUserId?: string
  fromUserName?: string
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
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token}`
      };
      
      if (tempRole) {
        headers['X-Temp-Role'] = tempRole;
      }

      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers
      })

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/${notificationId}/unread`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
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
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
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
        return notifications.filter(n => !n.isRead)
      case 'tasks':
        return notifications.filter(n => 
          n.type === 'task_assigned' || 
          n.type === 'task_completed' || 
          n.type === 'issue_assigned'
        )
      case 'system':
        return notifications.filter(n => n.type === 'system')
      default:
        return notifications
    }
  }

  const filteredNotifications = filterNotifications(notifications, activeTab)
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <>
      <style>{`
        :root {
          --background: #F8FAFC;
          --foreground: #1E293B;
          --card: #FFFFFF;
          --muted-foreground: #64748B;
          --primary: #2563EB;
          --border: #E2E8F0;
          --muted: #F1F5F9;
          --destructive: #EF4444;
          --destructive-foreground: #FFFFFF;
          --yellow-100: #FEF9C3;
          --yellow-200: #FEF08A;
          --yellow-600: #EAB308;
          --yellow-800: #CA8A04;
          --yellow-900: #A16207;
          --blue-100: #DBEAFE;
          --blue-200: #BFDBFE;
          --blue-400: #60A5FA;
          --blue-600: #2563EB;
          --blue-800: #1E40AF;
          --blue-900: #1E3A8A;
          --green-100: #DCFCE7;
          --green-200: #BBF7D0;
          --green-400: #4ADE80;
          --green-600: #22C55E;
          --green-800: #15803D;
          --green-900: #166534;
          --red-100: #FEE2E2;
          --red-200: #FECACA;
          --red-800: #991B1B;
          --red-900: #7F1D1D;
          --gray-100: #F3F4F6;
          --gray-200: #E5E7EB;
          --gray-400: #9CA3AF;
          --gray-500: #6B7280;
          --gray-600: #4B5563;
          --gray-700: #374151;
          --gray-800: #1F2A44;
          --gray-900: #111827;
        }
        .dark {
          --background: #0F172A;
          --foreground: #F1F5F9;
          --card: #1E293B;
          --muted-foreground: #94A3B8;
          --primary: #3B82F6;
          --border: #334155;
          --muted: #1E293B;
          --destructive: #DC2626;
          --destructive-foreground: #F1F5F9;
          --yellow-100: #FEF9C3;
          --yellow-200: #FEF08A;
          --yellow-600: #EAB308;
          --yellow-800: #CA8A04;
          --yellow-900: #A16207;
          --blue-100: #DBEAFE;
          --blue-200: #BFDBFE;
          --blue-400: #60A5FA;
          --blue-600: #2563EB;
          --blue-800: #1E40AF;
          --blue-900: #1E3A8A;
          --green-100: #DCFCE7;
          --green-200: #BBF7D0;
          --green-400: #4ADE80;
          --green-600: #22C55E;
          --green-800: #15803D;
          --green-900: #166534;
          --red-100: #FEE2E2;
          --red-200: #FECACA;
          --red-800: #991B1B;
          --red-900: #7F1D1D;
          --gray-100: #1F2A44;
          --gray-200: #2D3748;
          --gray-400: #6B7280;
          --gray-500: #9CA3AF;
          --gray-600: #D1D5DB;
          --gray-700: #E5E7EB;
          --gray-800: #D1D5DB;
          --gray-900: #F3F4F6;
        }
        html { scroll-behavior: smooth; }
        body {
          background-color: var(--background);
          color: var(--foreground);
          transition: background-color 0.3s ease, color 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .bg-background { background-color: var(--background); }
        .bg-card { background-color: var(--card); }
        .bg-muted { background-color: var(--muted); }
        .text-foreground { color: var(--foreground); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-primary { color: var(--primary); }
        .border-border { border-color: var(--border); }
        .bg-primary { background-color: var(--primary); }
        .text-destructive { color: var(--destructive); }
        .bg-destructive { background-color: var(--destructive); }
        .text-destructive-foreground { color: var(--destructive-foreground); }
        .bg-yellow-100 { background-color: var(--yellow-100); }
        .bg-yellow-200 { background-color: var(--yellow-200); }
        .text-yellow-600 { color: var(--yellow-600); }
        .text-yellow-800 { color: var(--yellow-800); }
        .bg-yellow-900\\/50 { background-color: rgba(161, 98, 7, 0.5); }
        .text-yellow-200 { color: var(--yellow-200); }
        .bg-blue-50 { background-color: #EFF6FF; }
        .bg-blue-100 { background-color: var(--blue-100); }
        .bg-blue-950\\/50 { background-color: rgba(23, 37, 84, 0.5); }
        .text-blue-600 { color: var(--blue-600); }
        .text-blue-800 { color: var(--blue-800); }
        .bg-blue-900\\/50 { background-color: rgba(30, 58, 138, 0.5); }
        .text-blue-200 { color: var(--blue-200); }
        .text-blue-400 { color: var(--blue-400); }
        .border-blue-200 { border-color: var(--blue-200); }
        .border-blue-800 { border-color: var(--blue-800); }
        .bg-green-100 { background-color: var(--green-100); }
        .text-green-600 { color: var(--green-600); }
        .text-green-800 { color: var(--green-800); }
        .bg-green-900\\/50 { background-color: rgba(22, 101, 52, 0.5); }
        .text-green-200 { color: var(--green-200); }
        .text-green-400 { color: var(--green-400); }
        .bg-red-100 { background-color: var(--red-100); }
        .text-red-800 { color: var(--red-800); }
        .bg-red-900\\/50 { background-color: rgba(127, 29, 29, 0.5); }
        .text-red-200 { color: var(--red-200); }
        .bg-gray-100 { background-color: var(--gray-100); }
        .bg-gray-800 { background-color: var(--gray-800); }
        .text-gray-800 { color: var(--gray-800); }
        .text-gray-200 { color: var(--gray-200); }
        .text-gray-400 { color: var(--gray-400); }
        .text-gray-500 { color: var(--gray-500); }
        .text-gray-600 { color: var(--gray-600); }
        .text-gray-700 { color: var(--gray-700); }
        .text-gray-900 { color: var(--gray-900); }
        button:focus-visible, input:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .h-3 { height: 0.75rem; }
        .w-3 { width: 0.75rem; }
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .h-5 { height: 1.25rem; }
        .w-5 { width: 1.25rem; }
        .h-8 { height: 2rem; }
        .w-8 { width: 2rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .space-x-1 > * + * { margin-left: 0.25rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-3 > * + * { margin-left: 0.75rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .p-0 { padding: 0; }
        .p-4 { padding: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .ml-2 { margin-left: 0.5rem; }
        .ml-4 { margin-left: 1rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .max-w-4xl { max-width: 56rem; }
        .w-full { width: 100%; }
        .min-w-0 { min-width: 0; }
        .flex { display: flex; }
        .flex-1 { flex: 1 1 0%; }
        .flex-shrink-0 { flex-shrink: 0; }
        .items-start { align-items: flex-start; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .transition-colors { transition: color 0.3s ease, background-color 0.3s ease; }
        .hover\\:text-destructive:hover { color: var(--destructive); }
      `}</style>
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
                                notification.isRead 
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
                                        {!notification.isRead && (
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
                                        {notification.fromUserName && (
                                          <div className="flex items-center space-x-1">
                                            <User className="h-3 w-3" />
                                            <span>{t.from} {notification.fromUserName}</span>
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
                                        onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                        title={notification.isRead ? t.markAsUnread : t.markAsRead}
                                      >
                                        {notification.isRead ? (
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
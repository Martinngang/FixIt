
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { User, Clock, MapPin, AlertCircle, RefreshCw, Camera, Wrench } from 'lucide-react'
import { Button } from './ui/button'
import { projectId } from '../utils/supabase/info'

const translations = {
  en: {
    myIssues: 'My Issues',
    myTasks: 'My Assigned Tasks',
    subtitle: 'Track the progress of issues you\'ve reported',
    tasksSubtitle: 'Track the progress of tasks assigned to you',
    refresh: 'Refresh',
    noIssuesTitle: 'No Issues Reported',
    noIssuesDesc: 'You haven\'t reported any issues yet',
    noIssuesAction: 'Use the "Report Issue" tab to submit your first issue',
    noTasksTitle: 'No Tasks Assigned',
    noTasksDesc: 'You don\'t have any assigned tasks yet',
    noTasksAction: 'Check back later for new assignments from administrators',
    location: 'Location',
    category: 'Category',
    reported: 'Reported',
    assignedOn: 'Assigned on',
    reportedBy: 'Reported by',
    adminNote: 'Admin Note:',
    technicianNote: 'Technician Note:',
    resolved: 'This issue has been resolved! Thank you for reporting it.',
    rejected: 'This issue was not accepted for resolution.',
    taskCompleted: 'Task completed successfully!',
    taskInProgress: 'Work in progress - keep up the good work!'
  },
  fr: {
    myIssues: 'Mes problèmes',
    myTasks: 'Mes tâches assignées',
    subtitle: 'Suivez le progrès des problèmes que vous avez signalés',
    tasksSubtitle: 'Suivez le progrès des tâches qui vous sont assignées',
    refresh: 'Actualiser',
    noIssuesTitle: 'Aucun problème signalé',
    noIssuesDesc: 'Vous n\'avez encore signalé aucun problème',
    noIssuesAction: 'Utilisez l\'onglet "Signaler un problème" pour soumettre votre premier problème',
    noTasksTitle: 'Aucune tâche assignée',
    noTasksDesc: 'Vous n\'avez pas encore de tâches assignées',
    noTasksAction: 'Vérifiez plus tard pour de nouvelles affectations des administrateurs',
    location: 'Emplacement',
    category: 'Catégorie',
    reported: 'Signalé',
    assignedOn: 'Assigné le',
    reportedBy: 'Signalé par',
    adminNote: 'Note admin:',
    technicianNote: 'Note technicien:',
    resolved: 'Ce problème a été résolu! Merci de l\'avoir signalé.',
    rejected: 'Ce problème n\'a pas été accepté pour résolution.',
    taskCompleted: 'Tâche terminée avec succès!',
    taskInProgress: 'Travail en cours - continuez le bon travail!'
  }
}

interface Issue {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: 'low' | 'medium' | 'high'
  status: 'reported' | 'in-progress' | 'resolved' | 'rejected'
  reportedBy: string
  reporterName: string
  reportedAt: string
  updatedAt: string
  adminNote?: string
  technicianNote?: string
  photoUrl?: string
  coordinates?: { lat: number; lng: number }
  assignedTechnician?: string
  assignedAt?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'reported':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
    case 'resolved':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
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

const getStatusMessage = (status: string, updatedAt: string, assignedAt?: string, viewMode?: string) => {
  const updatedDate = new Date(updatedAt).toLocaleDateString()
  const assignedDate = assignedAt ? new Date(assignedAt).toLocaleDateString() : null
  
  if (viewMode === 'technician') {
    switch (status) {
      case 'reported':
        return assignedDate ? `Assigned on ${assignedDate}` : `Reported on ${updatedDate}`
      case 'in-progress':
        return `Work started on ${updatedDate}`
      case 'resolved':
        return `Completed on ${updatedDate}`
      case 'rejected':
        return `Task cancelled on ${updatedDate}`
      default:
        return `Updated on ${updatedDate}`
    }
  } else {
    switch (status) {
      case 'reported':
        return `Reported on ${updatedDate}`
      case 'in-progress':
        return `Work started on ${updatedDate}`
      case 'resolved':
        return `Resolved on ${updatedDate}`
      case 'rejected':
        return `Rejected on ${updatedDate}`
      default:
        return `Updated on ${updatedDate}`
    }
  }
}

export function MyIssues({ session, language = 'en', viewMode = 'citizen', tempRole }: { session: any; language?: 'en' | 'fr'; viewMode?: 'citizen' | 'technician'; tempRole?: string | null }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const t = translations[language]
  const isTechnicianView = viewMode === 'technician'

  const fetchMyIssues = async () => {
    try {
      setLoading(true)
      setError('')

      if (!session?.access_token) {
        throw new Error('No valid session')
      }

      // Use different endpoint based on view mode
      const endpoint = isTechnicianView ? 'my-tasks' : 'my-issues'
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`
      }
      
      // Add temporary role header for testing if available
      if (tempRole) {
        headers['X-Temp-Role'] = tempRole
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/${endpoint}`, {
        headers
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setIssues(data.issues || [])
    } catch (err: any) {
      console.error('Fetch my issues error:', err)
      setError(err.message || `Failed to load your ${isTechnicianView ? 'tasks' : 'issues'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyIssues()
  }, [session, viewMode])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchMyIssues}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const title = isTechnicianView ? t.myTasks : t.myIssues
  const subtitle = isTechnicianView ? t.tasksSubtitle : t.subtitle
  const noItemsTitle = isTechnicianView ? t.noTasksTitle : t.noIssuesTitle
  const noItemsDesc = isTechnicianView ? t.noTasksDesc : t.noIssuesDesc
  const noItemsAction = isTechnicianView ? t.noTasksAction : t.noIssuesAction
  const icon = isTechnicianView ? Wrench : User

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
          --blue-50: #EFF6FF;
          --blue-100: #DBEAFE;
          --blue-200: #BFDBFE;
          --blue-400: #60A5FA;
          --blue-600: #2563EB;
          --blue-800: #1E40AF;
          --blue-900: #1E3A8A;
          --green-50: #F0FDF4;
          --green-100: #DCFCE7;
          --green-200: #BBF7D0;
          --green-400: #4ADE80;
          --green-600: #22C55E;
          --green-800: #15803D;
          --green-900: #166534;
          --red-50: #FEF2F2;
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
          --blue-50: #1E3A8A;
          --blue-100: #DBEAFE;
          --blue-200: #BFDBFE;
          --blue-400: #60A5FA;
          --blue-600: #2563EB;
          --blue-800: #1E40AF;
          --blue-900: #1E3A8A;
          --green-50: #166534;
          --green-100: #DCFCE7;
          --green-200: #BBF7D0;
          --green-400: #4ADE80;
          --green-600: #22C55E;
          --green-800: #15803D;
          --green-900: #166534;
          --red-50: #7F1D1D;
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
        .bg-blue-50 { background-color: var(--blue-50); }
        .bg-blue-100 { background-color: var(--blue-100); }
        .text-blue-600 { color: var(--blue-600); }
        .text-blue-800 { color: var(--blue-800); }
        .bg-blue-900\\/50 { background-color: rgba(30, 58, 138, 0.5); }
        .text-blue-200 { color: var(--blue-200); }
        .text-blue-400 { color: var(--blue-400); }
        .bg-green-50 { background-color: var(--green-50); }
        .bg-green-100 { background-color: var(--green-100); }
        .text-green-600 { color: var(--green-600); }
        .text-green-800 { color: var(--green-800); }
        .bg-green-900\\/50 { background-color: rgba(22, 101, 52, 0.5); }
        .text-green-200 { color: var(--green-200); }
        .text-green-400 { color: var(--green-400); }
        .bg-red-50 { background-color: var(--red-50); }
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .h-5 { height: 1.25rem; }
        .w-5 { width: 1.25rem; }
        .h-6 { height: 1.5rem; }
        .h-8 { height: 2rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .w-16 { width: 4rem; }
        .w-24 { width: 6rem; }
        .w-32 { width: 8rem; }
        .w-48 { width: 12rem; }
        .h-16 { height: 4rem; }
        .h-48 { height: 12rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-x-1 > * + * { margin-left: 0.25rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .ml-2 { margin-left: 0.5rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .max-w-sm { max-width: 24rem; }
        .w-full { width: 100%; }
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .relative { position: relative; }
        .transition-all { transition: all 0.3s ease; }
        .hover\\:bg-muted:hover { background-color: var(--muted); }
        .hover\\:bg-primary\\/90:hover { background-color: rgba(59, 130, 246, 0.9); }
      `}</style>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={fetchMyIssues}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    {isTechnicianView ? <Wrench className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    <span>{title}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
                <Button variant="outline" onClick={fetchMyIssues} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.refresh}
                </Button>
              </div>

              {issues.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="text-center py-12">
                    <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center">
                      {React.createElement(icon, { className: "h-12 w-12 text-muted-foreground" })}
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{noItemsTitle}</h3>
                    <p className="text-muted-foreground mb-4">{noItemsDesc}</p>
                    <p className="text-sm text-muted-foreground">{noItemsAction}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <Card key={issue.id} className="bg-card border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg text-foreground">{issue.title}</CardTitle>
                              <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                                {issue.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{issue.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{getStatusMessage(issue.status, issue.updatedAt, issue.assignedAt, viewMode)}</span>
                              </div>
                              {isTechnicianView && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{t.reportedBy}: {issue.reporterName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-foreground">{issue.description}</p>
                          
                          {issue.photoUrl && (
                            <div className="mb-3">
                              <img 
                                src={issue.photoUrl} 
                                alt="Issue photo" 
                                className="w-full max-w-sm h-48 object-cover rounded-lg border border-border"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{t.category}: {issue.category}</span>
                            <span>
                              {isTechnicianView && issue.assignedAt ? (
                                `${t.assignedOn}: ${new Date(issue.assignedAt).toLocaleDateString()}`
                              ) : (
                                `${t.reported}: ${new Date(issue.reportedAt).toLocaleDateString()}`
                              )}
                            </span>
                          </div>

                          {issue.adminNote && (
                            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">{t.adminNote}</h4>
                              <p className="text-blue-800 dark:text-blue-200 text-sm">{issue.adminNote}</p>
                            </div>
                          )}

                          {issue.technicianNote && (
                            <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                              <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">{t.technicianNote}</h4>
                              <p className="text-purple-800 dark:text-purple-200 text-sm">{issue.technicianNote}</p>
                            </div>
                          )}

                          {issue.status === 'resolved' && (
                            <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-3">
                              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                                ✅ {isTechnicianView ? t.taskCompleted : t.resolved}
                              </p>
                            </div>
                          )}

                          {issue.status === 'rejected' && (
                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                                ❌ {t.rejected}
                              </p>
                            </div>
                          )}

                          {issue.status === 'in-progress' && isTechnicianView && (
                            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                                🔧 {t.taskInProgress}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
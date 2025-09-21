
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { User, Clock, MapPin, AlertCircle, RefreshCw, Camera, Wrench } from 'lucide-react'
import { Button } from "./ui/button.tsx"
import { projectId } from "../utils/supabase/info.ts"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, viewMode])

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
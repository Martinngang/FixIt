
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { User, Clock, MapPin, AlertCircle, RefreshCw, Camera, Wrench, Award, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react'
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { projectId } from "../utils/supabase/info"
import { Comments } from "./Comments"
import { EntityCard } from "./ui/entity-card"
import { StatusBadge } from "./ui/status-badge"
import { EmptyState } from "./ui/empty-state"

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
    taskInProgress: 'Work in progress - keep up the good work!',
    impactTitle: 'Your Impact',
    impactDesc: 'See the difference your reports have made in the community.',
    impactPending: 'Your reports are being reviewed. Once they\'re resolved, your impact will appear here.',
    impactSummary: 'You\'ve helped resolve {count} {issues} in your community, with an estimated value of {amount} returned to the city.',
    issueSingular: 'issue',
    issuePlural: 'issues',
    statReported: 'Reports Submitted',
    statResolved: 'Issues Resolved',
    statResolutionRate: 'Resolution Rate',
    statEstimatedValue: 'Estimated Value to City',
    avgResolutionDaysLabel: 'avg. {days} days to resolve',
    byCategory: 'Resolved by Category',
    resolvedOfReported: '{resolved} of {reported} resolved',
    estimatedValueNote: 'Illustrative estimate based on typical municipal resolution costs per category.'
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
    taskInProgress: 'Travail en cours - continuez le bon travail!',
    impactTitle: 'Votre impact',
    impactDesc: 'Découvrez la différence que vos signalements ont apportée à la communauté.',
    impactPending: 'Vos signalements sont en cours d\'examen. Une fois résolus, votre impact apparaîtra ici.',
    impactSummary: 'Vous avez contribué à résoudre {count} {issues} dans votre communauté, pour une valeur estimée de {amount} retournée à la ville.',
    issueSingular: 'problème',
    issuePlural: 'problèmes',
    statReported: 'Signalements soumis',
    statResolved: 'Problèmes résolus',
    statResolutionRate: 'Taux de résolution',
    statEstimatedValue: 'Valeur estimée pour la ville',
    avgResolutionDaysLabel: 'en moy. {days} jours pour résoudre',
    byCategory: 'Résolutions par catégorie',
    resolvedOfReported: '{resolved} sur {reported} résolus',
    estimatedValueNote: 'Estimation illustrative basée sur les coûts de résolution municipaux typiques par catégorie.'
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

interface ImpactReport {
  totalReported: number
  totalResolved: number
  resolutionRate: number
  categoryBreakdown: Record<string, { reported: number; resolved: number }>
  estimatedSavings: number
  avgResolutionDays: number | null
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
  const [impact, setImpact] = useState<ImpactReport | null>(null)
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

      const [response, impactResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/${endpoint}`, { headers }),
        isTechnicianView
          ? Promise.resolve(null)
          : fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/my-impact`, { headers })
      ])

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setIssues(data.issues || [])

      if (impactResponse?.ok) {
        const impactData = await impactResponse.json()
        setImpact(impactData.impact || null)
      }
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
      <div className="space-y-4 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
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
      <Alert variant="destructive" className="animate-fade-in">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchMyIssues}>
            <RefreshCw className="h-4 w-4" />
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <span>{title}</span>
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="outline" onClick={fetchMyIssues} disabled={loading} className="self-start sm:self-auto">
          <RefreshCw className="h-4 w-4" />
          {t.refresh}
        </Button>
      </div>

      {!isTechnicianView && impact && impact.totalReported > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>{t.impactTitle}</span>
            </CardTitle>
            <CardDescription>{t.impactDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {impact.totalResolved === 0 ? (
              <p className="text-sm text-muted-foreground">{t.impactPending}</p>
            ) : (
              <>
                <p className="text-foreground">
                  {t.impactSummary
                    .replace('{count}', String(impact.totalResolved))
                    .replace('{issues}', impact.totalResolved === 1 ? t.issueSingular : t.issuePlural)
                    .replace('{amount}', `$${impact.estimatedSavings.toLocaleString()}`)}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{t.statReported}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground">{impact.totalReported}</div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t.statResolved}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-success">{impact.totalResolved}</div>
                    {impact.avgResolutionDays !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.avgResolutionDaysLabel.replace('{days}', String(impact.avgResolutionDays))}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{t.statResolutionRate}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground">{impact.resolutionRate}%</div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{t.statEstimatedValue}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground">${impact.estimatedSavings.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">{t.byCategory}</p>
                  <div className="space-y-2">
                    {Object.entries(impact.categoryBreakdown)
                      .filter(([, counts]) => counts.resolved > 0)
                      .sort(([, a], [, b]) => b.resolved - a.resolved)
                      .map(([category, counts]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-foreground">{category}</span>
                            <span className="text-muted-foreground">
                              {t.resolvedOfReported
                                .replace('{resolved}', String(counts.resolved))
                                .replace('{reported}', String(counts.reported))}
                            </span>
                          </div>
                          <Progress value={(counts.resolved / counts.reported) * 100} className="h-2" />
                        </div>
                      ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{t.estimatedValueNote}</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {issues.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={icon} title={noItemsTitle} description={`${noItemsDesc}. ${noItemsAction}.`} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <EntityCard
              key={issue.id}
              title={issue.title}
              subtitle={issue.description}
              badges={[
                <StatusBadge key="priority" kind="priority" value={issue.priority} label={issue.priority} />,
                <StatusBadge key="status" kind="status" value={issue.status} label={issue.status.replace('-', ' ')} />,
              ]}
              metadata={[
                { icon: MapPin, label: issue.location },
                { icon: Clock, label: getStatusMessage(issue.status, issue.updatedAt, issue.assignedAt, viewMode) },
                ...(isTechnicianView ? [{ icon: User, label: `${t.reportedBy}: ${issue.reporterName}` }] : []),
              ]}
              photoUrl={issue.photoUrl}
              notes={[
                ...(issue.adminNote ? [{ icon: AlertCircle, label: t.adminNote, content: issue.adminNote }] : []),
                ...(issue.technicianNote ? [{ icon: Wrench, label: t.technicianNote, content: issue.technicianNote }] : []),
              ]}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm text-muted-foreground mt-1">
                <span>{t.category}: {issue.category}</span>
                <span>
                  {isTechnicianView && issue.assignedAt ? (
                    `${t.assignedOn}: ${new Date(issue.assignedAt).toLocaleDateString()}`
                  ) : (
                    `${t.reported}: ${new Date(issue.reportedAt).toLocaleDateString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-end mt-3">
                <Comments entityType="issue" entityId={issue.id} session={session} language={language} tempRole={tempRole} />
              </div>
            </EntityCard>
          ))}
        </div>
      )}
    </div>
  )
}

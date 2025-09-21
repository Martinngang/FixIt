import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { useToast } from "./ToastContext.tsx";
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx"
import { 
  Wrench, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  FileText,
  Camera,
  Navigation,
  Loader2,
  Save,
  Eye
} from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"

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
  assignedTo?: string
  estimatedCompletionDate?: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'reported':
      return <AlertCircle className="h-4 w-4" />
    case 'in-progress':
      return <Clock className="h-4 w-4" />
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />
    case 'rejected':
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
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

const translations = {
  en: {
    technicianPanel: 'Technician Panel',
    fieldOperations: 'Field Operations Dashboard',
    myAssignments: 'My Assignments',
    allIssues: 'All Issues',
    workLog: 'Work Log',
    issueDetails: 'Issue Details',
    updateStatus: 'Update Status',
    addNote: 'Add Technical Note',
    assignToMe: 'Assign to Me',
    viewOnMap: 'View on Map',
    updateIssue: 'Update Issue',
    technicianNote: 'Technician Note',
    notePlaceholder: 'Add technical details, work performed, or status updates...',
    status: 'Status',
    estimatedCompletion: 'Estimated Completion',
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',
    reported: 'Reported',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    priority: 'Priority',
    category: 'Category',
    location: 'Location',
    reportedBy: 'Reported by',
    reportedAt: 'Reported at',
    lastUpdated: 'Last updated',
    noAssignments: 'No assignments yet',
    noAssignmentsDesc: 'Check back later for new work assignments',
    noIssues: 'No issues found',
    noIssuesDesc: 'All issues are up to date',
    viewPhoto: 'View Photo',
    photoNotAvailable: 'Photo not available',
    successUpdate: 'Issue updated successfully',
    errorUpdate: 'Failed to update issue',
    loadingIssues: 'Loading issues...',
    unassigned: 'Unassigned',
    assignedTo: 'Assigned to',
    workCompleted: 'Work completed successfully',
    requiresFollowUp: 'Requires follow-up',
    cannotComplete: 'Cannot complete - requires additional resources'
  },
  fr: {
    technicianPanel: 'Panneau technicien',
    fieldOperations: 'Tableau de bord des opérations terrain',
    myAssignments: 'Mes affectations',
    allIssues: 'Tous les problèmes',
    workLog: 'Journal de travail',
    issueDetails: 'Détails du problème',
    updateStatus: 'Mettre à jour le statut',
    addNote: 'Ajouter une note technique',
    assignToMe: 'M\'assigner',
    viewOnMap: 'Voir sur la carte',
    updateIssue: 'Mettre à jour le problème',
    technicianNote: 'Note du technicien',
    notePlaceholder: 'Ajouter des détails techniques, travaux effectués ou mises à jour du statut...',
    status: 'Statut',
    estimatedCompletion: 'Achèvement estimé',
    save: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    reported: 'Signalé',
    inProgress: 'En cours',
    resolved: 'Résolu',
    rejected: 'Rejeté',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
    priority: 'Priorité',
    category: 'Catégorie',
    location: 'Emplacement',
    reportedBy: 'Signalé par',
    reportedAt: 'Signalé le',
    lastUpdated: 'Dernière mise à jour',
    noAssignments: 'Aucune affectation',
    noAssignmentsDesc: 'Vérifiez plus tard pour de nouvelles affectations',
    noIssues: 'Aucun problème trouvé',
    noIssuesDesc: 'Tous les problèmes sont à jour',
    viewPhoto: 'Voir la photo',
    photoNotAvailable: 'Photo non disponible',
    successUpdate: 'Problème mis à jour avec succès',
    errorUpdate: 'Échec de la mise à jour du problème',
    loadingIssues: 'Chargement des problèmes...',
    unassigned: 'Non assigné',
    assignedTo: 'Assigné à',
    workCompleted: 'Travail terminé avec succès',
    requiresFollowUp: 'Nécessite un suivi',
    cannotComplete: 'Impossible de terminer - nécessite des ressources supplémentaires'
  }
}

export function TechnicianPanel({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<boolean | string>(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    technicianNote: '',
    estimatedCompletion: ''
  })

  const t = translations[language]
  const { addToast } = useToast();
  const technicianId = session?.user?.id || ''
  const technicianName = session?.user?.user_metadata?.name || session?.user?.email || 'Unknown'

  const handleError = useCallback((message: string) => {
    addToast(message, 'error');
    console.error(message);
  }, [addToast]);

  const fetchIssues = async () => {
    try {
      setLoading(true)

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setIssues(data.issues || [])
    } catch (err: any) {
      console.error('Fetch issues error:', err)
      handleError(err.message || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      fetchIssues()
    }
  }, [session])

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return

    setUpdateLoading(true)

    try {
      const updateData = {
        status: updateForm.status || selectedIssue.status,
        technicianNote: updateForm.technicianNote,
        assignedTo: technicianId,
        estimatedCompletionDate: updateForm.estimatedCompletion || null
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${selectedIssue.id}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      addToast(t.successUpdate, 'success');
      setIsUpdateDialogOpen(false)
      fetchIssues() // Refresh the list
    } catch (err: any) {
      console.error('Update issue error:', err)
      handleError(err.message || t.errorUpdate)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAssignToMe = async (issue: Issue) => {
    setUpdateLoading(issue.id);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issue.id}/assign-to-me`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            issueId: issue.id,
            technicianId: technicianId
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }

      addToast(t.assignToMe + ' successful', 'success');
      fetchIssues() // Refresh the list
    } catch (err: any) {
      console.error('Assign issue error:', err)
      handleError(err.message || 'Failed to assign issue')
    } finally {
      setUpdateLoading(false);
    }
  }

  const openUpdateDialog = (issue: Issue) => {
    setSelectedIssue(issue)
    setUpdateForm({
      status: issue.status,
      technicianNote: issue.technicianNote || '',
      estimatedCompletion: issue.estimatedCompletionDate || ''
    })
    setIsUpdateDialogOpen(true)
  }

  const openGoogleMaps = (issue: Issue) => {
    if (issue.coordinates) {
      const url = `https://www.google.com/maps?q=${issue.coordinates.lat},${issue.coordinates.lng}`
      window.open(url, '_blank')
    } else {
      const encodedLocation = encodeURIComponent(issue.location)
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
      window.open(url, '_blank')
    }
  }

  const myAssignments = issues.filter(issue => issue.assignedTo === technicianId)
  const unassignedIssues = issues.filter(issue => !issue.assignedTo || issue.assignedTo === '')

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
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
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>{t.technicianPanel}</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t.fieldOperations}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {myAssignments.length}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.myAssignments}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        {unassignedIssues.length}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.unassigned}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {issues.filter(i => i.status === 'resolved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.resolved}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="assignments" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="assignments" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t.myAssignments}</span>
                  </TabsTrigger>
                  <TabsTrigger value="all-issues" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t.allIssues}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-4">
                  {myAssignments.length === 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="text-center py-8">
                        <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.noAssignments}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t.noAssignmentsDesc}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    myAssignments.map((issue) => (
                      <Card key={issue.id} className="bg-card border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-foreground">{issue.title}</h3>
                                <Badge className={getPriorityColor(issue.priority)}>
                                  {t[issue.priority as keyof typeof t] || issue.priority}
                                </Badge>
                                <Badge className={getStatusColor(issue.status)}>
                                  {getStatusIcon(issue.status)}
                                  <span className="ml-1 capitalize">
                                    {t[issue.status.replace('-', '') as keyof typeof t] || issue.status.replace('-', ' ')}
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-3">{issue.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{issue.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              {issue.technicianNote && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-foreground">{t.technicianNote}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{issue.technicianNote}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => openUpdateDialog(issue)}
                                className="flex items-center space-x-1"
                              >
                                <Save className="h-4 w-4" />
                                <span>{t.updateStatus}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openGoogleMaps(issue)}
                                className="flex items-center space-x-1"
                              >
                                <Navigation className="h-4 w-4" />
                                <span>{t.viewOnMap}</span>
                              </Button>
                              {issue.photoUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(issue.photoUrl, '_blank')}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>{t.viewPhoto}</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all-issues" className="space-y-4">
                  {unassignedIssues.length === 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.noIssues}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t.noIssuesDesc}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    unassignedIssues.map((issue) => (
                      <Card key={issue.id} className="bg-card border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-foreground">{issue.title}</h3>
                                <Badge className={getPriorityColor(issue.priority)}>
                                  {t[issue.priority as keyof typeof t] || issue.priority}
                                </Badge>
                                <Badge className={getStatusColor(issue.status)}>
                                  {getStatusIcon(issue.status)}
                                  <span className="ml-1 capitalize">
                                    {t[issue.status.replace('-', '') as keyof typeof t] || issue.status.replace('-', ' ')}
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-3">{issue.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{issue.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{issue.reporterName}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleAssignToMe(issue)}
                                disabled={updateLoading === issue.id}
                                className="flex items-center space-x-1"
                              >
                                {updateLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                                <span>{t.assignToMe}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openGoogleMaps(issue)}
                                className="flex items-center space-x-1"
                              >
                                <Navigation className="h-4 w-4" />
                                <span>{t.viewOnMap}</span>
                              </Button>
                              {issue.photoUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(issue.photoUrl, '_blank')}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>{t.viewPhoto}</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {/* Update Issue Dialog */}
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">{t.updateIssue}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {selectedIssue?.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-foreground">{t.status}</Label>
                      <Select
                        value={updateForm.status}
                        onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
                          <SelectItem value="reported">{t.reported}</SelectItem>
                          <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                          <SelectItem value="resolved">{t.resolved}</SelectItem>
                          <SelectItem value="rejected">{t.rejected}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technician-note" className="text-foreground">{t.technicianNote}</Label>
                      <Textarea
                        id="technician-note"
                        placeholder={t.notePlaceholder}
                        value={updateForm.technicianNote}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, technicianNote: e.target.value }))}
                        rows={4}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimated-completion" className="text-foreground">{t.estimatedCompletion}</Label>
                      <Input
                        id="estimated-completion"
                        type="date"
                        value={updateForm.estimatedCompletion}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUpdateDialogOpen(false)}
                      disabled={!!updateLoading}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleUpdateIssue}
                      disabled={!!updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
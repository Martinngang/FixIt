import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { CredibilityBadge } from "./ui/credibility-badge.tsx"
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
import { EntityCard } from "./ui/entity-card.tsx"
import { StatusBadge } from "./ui/status-badge.tsx"
import { EmptyState } from "./ui/empty-state.tsx"
import { StatusUpdateDialog } from "./ui/status-update-dialog.tsx"
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
  Eye,
  Wifi,
  Coffee,
  Moon,
  MapPinned,
  Package
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
  credibilityScore?: number
  credibilityLevel?: 'high' | 'medium' | 'low'
  credibilitySignals?: {
    hasPhoto: boolean
    hasCoordinates: boolean
    descriptionLength: number
    corroboratingReports: number
    upvotes: number
    reporterRejectionRate: number | null
  }
  estimatedCompletionDate?: string
  requiredParts?: Array<{
    id: string
    itemId: string
    itemName: string
    unit: string
    quantityRequested: number
    quantityFulfilled: number
    status: 'fulfilled' | 'shortage'
    requestedAt: string
  }>
}

interface InventoryItem {
  id: string
  name: string
  unit: string
  quantityOnHand: number
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
    cannotComplete: 'Cannot complete - requires additional resources',
    myStatus: 'My Status',
    myStatusDesc: 'Let dispatch know your availability and location for smarter assignment suggestions.',
    availability: 'Availability',
    available: 'Available',
    busy: 'Busy',
    offDuty: 'Off Duty',
    updateLocation: 'Update My Location',
    locatingLocation: 'Locating...',
    locationUpdated: 'Location updated',
    locationError: 'Failed to get your location',
    statusUpdated: 'Availability updated',
    statusUpdateError: 'Failed to update availability',
    lastLocationUpdate: 'Last updated',
    requestParts: 'Request Parts',
    requestPartsTitle: 'Request Parts',
    requestPartsDesc: 'Request inventory items needed to complete this issue.',
    selectPart: 'Part',
    selectPartPlaceholder: 'Select a part',
    quantity: 'Quantity',
    requiredParts: 'Requested Parts',
    fulfilled: 'Fulfilled',
    shortage: 'Shortage',
    noInventoryItems: 'No inventory items available',
    partsRequested: 'Parts requested',
    partsRequestError: 'Failed to request parts',
    requestSubmit: 'Request',
    requesting: 'Requesting...',
    availableQty: 'available'
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
    cannotComplete: 'Impossible de terminer - nécessite des ressources supplémentaires',
    myStatus: 'Mon statut',
    myStatusDesc: 'Indiquez votre disponibilité et votre position pour de meilleures suggestions d\'affectation.',
    availability: 'Disponibilité',
    available: 'Disponible',
    busy: 'Occupé',
    offDuty: 'Hors service',
    updateLocation: 'Mettre à jour ma position',
    locatingLocation: 'Localisation...',
    locationUpdated: 'Position mise à jour',
    locationError: 'Impossible d\'obtenir votre position',
    statusUpdated: 'Disponibilité mise à jour',
    statusUpdateError: 'Échec de la mise à jour de la disponibilité',
    lastLocationUpdate: 'Dernière mise à jour',
    requestParts: 'Demander des pièces',
    requestPartsTitle: 'Demander des pièces',
    requestPartsDesc: 'Demandez les articles d\'inventaire nécessaires pour terminer ce problème.',
    selectPart: 'Pièce',
    selectPartPlaceholder: 'Sélectionner une pièce',
    quantity: 'Quantité',
    requiredParts: 'Pièces demandées',
    fulfilled: 'Fournie',
    shortage: 'Pénurie',
    noInventoryItems: 'Aucun article d\'inventaire disponible',
    partsRequested: 'Pièces demandées avec succès',
    partsRequestError: 'Échec de la demande de pièces',
    requestSubmit: 'Demander',
    requesting: 'Demande en cours...',
    availableQty: 'disponible'
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
  const [availability, setAvailability] = useState<'available' | 'busy' | 'off_duty'>('available')
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<string | null>(null)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [locating, setLocating] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [partsDialogOpen, setPartsDialogOpen] = useState(false)
  const [partsTargetIssue, setPartsTargetIssue] = useState<Issue | null>(null)
  const [partsForm, setPartsForm] = useState({ itemId: '', quantity: '1' })
  const [requestingParts, setRequestingParts] = useState(false)

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

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (!response.ok) return
      const data = await response.json()
      setAvailability(data.user?.availability || 'available')
      setLocationUpdatedAt(data.user?.locationUpdatedAt || null)
    } catch (err) {
      console.error('Fetch profile error:', err)
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/inventory`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (!response.ok) return
      const data = await response.json()
      setInventoryItems(data.items || [])
    } catch (err) {
      console.error('Fetch inventory error:', err)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      fetchIssues()
      fetchProfile()
      fetchInventory()
    }
  }, [session])

  const updateProfile = async (updates: Record<string, unknown>) => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  const handleAvailabilityChange = async (value: 'available' | 'busy' | 'off_duty') => {
    setSavingAvailability(true)
    try {
      await updateProfile({ availability: value })
      setAvailability(value)
      addToast(t.statusUpdated, 'success')
    } catch (err: any) {
      handleError(err.message || t.statusUpdateError)
    } finally {
      setSavingAvailability(false)
    }
  }

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      handleError(t.locationError)
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await updateProfile({
            location: { lat: position.coords.latitude, lng: position.coords.longitude }
          })
          setLocationUpdatedAt(data.user?.locationUpdatedAt || new Date().toISOString())
          addToast(t.locationUpdated, 'success')
        } catch (err: any) {
          handleError(err.message || t.locationError)
        } finally {
          setLocating(false)
        }
      },
      () => {
        handleError(t.locationError)
        setLocating(false)
      }
    )
  }

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

  const openPartsDialog = (issue: Issue) => {
    setPartsTargetIssue(issue)
    setPartsForm({ itemId: inventoryItems[0]?.id || '', quantity: '1' })
    setPartsDialogOpen(true)
  }

  const handleRequestParts = async () => {
    if (!partsTargetIssue || !partsForm.itemId) return

    setRequestingParts(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${partsTargetIssue.id}/request-parts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ itemId: partsForm.itemId, quantity: Number(partsForm.quantity) })
        }
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || t.partsRequestError)

      setIssues(prev => prev.map(i => i.id === data.issue.id ? data.issue : i))
      setInventoryItems(prev => prev.map(i => i.id === data.item.id ? data.item : i))
      setPartsDialogOpen(false)
      addToast(t.partsRequested, 'success')
    } catch (err: any) {
      console.error('Request parts error:', err)
      handleError(err.message || t.partsRequestError)
    } finally {
      setRequestingParts(false)
    }
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span>{t.technicianPanel}</span>
            </CardTitle>
            <CardDescription>
              {t.fieldOperations}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-display font-bold text-info mb-2">
                  {myAssignments.length}
                </div>
                <div className="text-sm text-muted-foreground">{t.myAssignments}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-display font-bold text-warning mb-2">
                  {unassignedIssues.length}
                </div>
                <div className="text-sm text-muted-foreground">{t.unassigned}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-display font-bold text-success mb-2">
                  {issues.filter(i => i.status === 'resolved').length}
                </div>
                <div className="text-sm text-muted-foreground">{t.resolved}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              <span>{t.myStatus}</span>
            </CardTitle>
            <CardDescription>
              {t.myStatusDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>{t.availability}</Label>
                <Select
                  value={availability}
                  onValueChange={(value) => handleAvailabilityChange(value as 'available' | 'busy' | 'off_duty')}
                  disabled={savingAvailability}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <span className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-success" />
                        <span>{t.available}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="busy">
                      <span className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-warning" />
                        <span>{t.busy}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="off_duty">
                      <span className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span>{t.offDuty}</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" onClick={handleUpdateLocation} disabled={locating}>
                  {locating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {locating ? t.locatingLocation : t.updateLocation}
                </Button>
                {locationUpdatedAt && (
                  <p className="text-xs text-muted-foreground">
                    {t.lastLocationUpdate}: {new Date(locationUpdatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

              <Tabs defaultValue="assignments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
                  <TabsTrigger value="assignments" className="gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{t.myAssignments}</span>
                  </TabsTrigger>
                  <TabsTrigger value="all-issues" className="gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{t.allIssues}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-4">
                  {myAssignments.length === 0 ? (
                    <EmptyState icon={Wrench} title={t.noAssignments} description={t.noAssignmentsDesc} />
                  ) : (
                    myAssignments.map((issue) => (
                      <EntityCard
                        key={issue.id}
                        title={issue.title}
                        subtitle={issue.description}
                        badges={[
                          <StatusBadge key="priority" kind="priority" value={issue.priority} label={t[issue.priority as keyof typeof t] || issue.priority} />,
                          <StatusBadge key="status" kind="status" value={issue.status} label={t[issue.status.replace('-', '') as keyof typeof t] || issue.status.replace('-', ' ')} />,
                          ...(issue.credibilityLevel && issue.credibilityLevel !== 'high' ? [
                            <CredibilityBadge key="cred" level={issue.credibilityLevel} score={issue.credibilityScore} signals={issue.credibilitySignals} />,
                          ] : []),
                        ]}
                        metadata={[
                          { icon: MapPin, label: issue.location },
                          { icon: Calendar, label: new Date(issue.reportedAt).toLocaleDateString() },
                        ]}
                        notes={[
                          ...(issue.technicianNote ? [{ icon: FileText, label: t.technicianNote, content: issue.technicianNote }] : []),
                          ...(issue.requiredParts && issue.requiredParts.length > 0 ? [{
                            icon: Package,
                            label: t.requiredParts,
                            content: (
                              <div className="space-y-2">
                                {issue.requiredParts.map((part) => (
                                  <div key={part.id} className="flex items-center justify-between">
                                    <span>{part.itemName} x{part.quantityRequested} {part.unit}</span>
                                    <Badge variant={part.status === 'fulfilled' ? 'success' : 'destructive'}>
                                      {part.status === 'fulfilled' ? t.fulfilled : t.shortage}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ),
                          }] : []),
                        ]}
                        actions={[
                          { icon: Save, label: t.updateStatus, onClick: () => openUpdateDialog(issue), variant: 'default' },
                          { icon: Package, label: t.requestParts, onClick: () => openPartsDialog(issue) },
                          { icon: Navigation, label: t.viewOnMap, onClick: () => openGoogleMaps(issue) },
                          ...(issue.photoUrl ? [{ icon: Eye, label: t.viewPhoto, onClick: () => window.open(issue.photoUrl, '_blank') }] : []),
                        ]}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all-issues" className="space-y-4">
                  {unassignedIssues.length === 0 ? (
                    <EmptyState icon={CheckCircle} title={t.noIssues} description={t.noIssuesDesc} />
                  ) : (
                    unassignedIssues.map((issue) => (
                      <EntityCard
                        key={issue.id}
                        title={issue.title}
                        subtitle={issue.description}
                        badges={[
                          <StatusBadge key="priority" kind="priority" value={issue.priority} label={t[issue.priority as keyof typeof t] || issue.priority} />,
                          <StatusBadge key="status" kind="status" value={issue.status} label={t[issue.status.replace('-', '') as keyof typeof t] || issue.status.replace('-', ' ')} />,
                          ...(issue.credibilityLevel && issue.credibilityLevel !== 'high' ? [
                            <CredibilityBadge key="cred" level={issue.credibilityLevel} score={issue.credibilityScore} signals={issue.credibilitySignals} />,
                          ] : []),
                        ]}
                        metadata={[
                          { icon: MapPin, label: issue.location },
                          { icon: User, label: issue.reporterName },
                          { icon: Calendar, label: new Date(issue.reportedAt).toLocaleDateString() },
                        ]}
                        actions={[
                          {
                            icon: User,
                            label: t.assignToMe,
                            onClick: () => handleAssignToMe(issue),
                            variant: 'default',
                            disabled: updateLoading === issue.id,
                          },
                          { icon: Navigation, label: t.viewOnMap, onClick: () => openGoogleMaps(issue) },
                          ...(issue.photoUrl ? [{ icon: Eye, label: t.viewPhoto, onClick: () => window.open(issue.photoUrl, '_blank') }] : []),
                        ]}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {/* Update Issue Dialog */}
              <StatusUpdateDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                title={t.updateIssue}
                description={selectedIssue?.title}
                statusValue={updateForm.status}
                onStatusChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                statusOptions={[
                  { value: 'reported', label: t.reported },
                  { value: 'in-progress', label: t.inProgress },
                  { value: 'resolved', label: t.resolved },
                  { value: 'rejected', label: t.rejected },
                ]}
                note={{
                  label: t.technicianNote,
                  value: updateForm.technicianNote,
                  onChange: (value) => setUpdateForm(prev => ({ ...prev, technicianNote: value })),
                  placeholder: t.notePlaceholder,
                }}
                eta={{
                  label: t.estimatedCompletion,
                  value: updateForm.estimatedCompletion,
                  onChange: (value) => setUpdateForm(prev => ({ ...prev, estimatedCompletion: value })),
                }}
                onSubmit={handleUpdateIssue}
                submitting={!!updateLoading}
                submitLabel={updateLoading ? t.saving : t.save}
                cancelLabel={t.cancel}
              />

              {/* Request Parts Dialog */}
              <Dialog open={partsDialogOpen} onOpenChange={setPartsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.requestPartsTitle}</DialogTitle>
                    <DialogDescription>
                      {partsTargetIssue?.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t.requestPartsDesc}</p>
                    {inventoryItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.noInventoryItems}</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>{t.selectPart}</Label>
                          <Select
                            value={partsForm.itemId}
                            onValueChange={(value) => setPartsForm(prev => ({ ...prev, itemId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.selectPartPlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} ({item.quantityOnHand} {item.unit} {t.availableQty})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parts-quantity">{t.quantity}</Label>
                          <Input
                            id="parts-quantity"
                            type="number"
                            min="1"
                            value={partsForm.quantity}
                            onChange={(e) => setPartsForm(prev => ({ ...prev, quantity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setPartsDialogOpen(false)}
                      disabled={requestingParts}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleRequestParts}
                      disabled={requestingParts || inventoryItems.length === 0 || !partsForm.itemId}
                    >
                      {requestingParts ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                      {requestingParts ? t.requesting : t.requestSubmit}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
      </div>
  )
}
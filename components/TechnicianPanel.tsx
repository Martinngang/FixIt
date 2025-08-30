import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
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
import { projectId } from '../utils/supabase/info'

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
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    technicianNote: '',
    estimatedCompletion: ''
  })

  const t = translations[language]
  const technicianId = session?.user?.id || ''
  const technicianName = session?.user?.user_metadata?.name || session?.user?.email || 'Unknown'

  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError('')

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
      setError(err.message || 'Failed to load issues')
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
    setError('')
    setSuccess('')

    try {
      const updateData = {
        status: updateForm.status || selectedIssue.status,
        technicianNote: updateForm.technicianNote,
        assignedTechnician: technicianId,
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

      setSuccess(t.successUpdate)
      setIsUpdateDialogOpen(false)
      fetchIssues() // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Update issue error:', err)
      setError(err.message || t.errorUpdate)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAssignToMe = async (issue: Issue) => {
    setUpdateLoading(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        assignedTechnician: technicianId,
        status: 'in-progress'
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issue.id}/update`,
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

      setSuccess('Issue assigned successfully')
      fetchIssues() // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Assign issue error:', err)
      setError(err.message || 'Failed to assign issue')
    } finally {
      setUpdateLoading(false)
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

  const myAssignments = issues.filter(issue => issue.assignedTechnician === technicianId)
  const unassignedIssues = issues.filter(issue => !issue.assignedTechnician || issue.assignedTechnician === '')

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
        .bg-blue-100 { background-color: var(--blue-100); }
        .text-blue-600 { color: var(--blue-600); }
        .text-blue-800 { color: var(--blue-800); }
        .bg-blue-900\\/50 { background-color: rgba(30, 58, 138, 0.5); }
        .text-blue-200 { color: var(--blue-200); }
        .text-blue-400 { color: var(--blue-400); }
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
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-x-1 > * + * { margin-left: 0.25rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .p-6 { padding: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .ml-1 { margin-left: 0.25rem; }
        .ml-4 { margin-left: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .max-w-4xl { max-width: 56rem; }
        .w-full { width: 100%; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .md\\:grid-cols-3 { @media (min-width: 768px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        .gap-4 { gap: 1rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
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
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

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
                                disabled={updateLoading}
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
                        <SelectContent>
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
                      disabled={updateLoading}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleUpdateIssue}
                      disabled={updateLoading}
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
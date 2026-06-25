import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useToast } from "./ToastContext"
import { Comments } from "./Comments"
import { StatusBadge } from "./ui/status-badge"
import {
  Heart, CalendarDays, MapPin, Users, Plus, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Loader2, Trash2, HandHeart, Newspaper, ThumbsUp, Clock,
  Trophy, Medal, Award, Lightbulb, ArrowBigUp,
} from 'lucide-react'
import { projectId } from "../utils/supabase/info"

interface VolunteerTask {
  id: string
  title: string
  description: string
  category: string
  location: string
  maxVolunteers: number | null
  status: 'open' | 'completed' | 'cancelled'
  volunteers: Array<{ userId: string; userName: string; joinedAt: string }>
  createdByName: string
  createdAt: string
}

interface CommunityEvent {
  id: string
  title: string
  description: string
  category: string
  location: string
  eventDate: string
  maxAttendees: number | null
  status: 'upcoming' | 'completed' | 'cancelled'
  attendees: Array<{ userId: string; userName: string; joinedAt: string }>
  createdByName: string
  createdAt: string
}

interface Issue {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: 'low' | 'medium' | 'high'
  status: 'reported' | 'in-progress' | 'assigned' | 'resolved' | 'rejected'
  reporterName: string
  reportedAt: string
  photoUrl?: string
  upvotes?: number
  upvotedBy?: string[]
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  points: number
  badge: string
}

interface Idea {
  id: string
  title: string
  description: string
  category: string
  status: 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected'
  upvotes: number
  upvotedBy: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

// Matches REPUTATION_POINTS.volunteerTaskCompleted in the backend issueModel -
// shown on task cards so volunteers know what completing a task is worth.
const TASK_COMPLETION_POINTS = 10

const VOLUNTEER_CATEGORIES = [
  { en: 'Litter Cleanup', fr: 'Nettoyage des déchets' },
  { en: 'Graffiti Removal', fr: 'Suppression de graffitis' },
  { en: 'Park Maintenance', fr: 'Entretien des parcs' },
  { en: 'Tree Planting', fr: "Plantation d'arbres" },
  { en: 'Community Garden', fr: 'Jardin communautaire' },
  { en: 'Other', fr: 'Autre' },
]

const EVENT_CATEGORIES = [
  { en: 'Clean-up Drive', fr: 'Opération de nettoyage' },
  { en: 'Neighborhood Watch', fr: 'Surveillance de quartier' },
  { en: 'Tree Planting', fr: "Plantation d'arbres" },
  { en: 'Community Meeting', fr: 'Réunion communautaire' },
  { en: 'Awareness Campaign', fr: 'Campagne de sensibilisation' },
  { en: 'Other', fr: 'Autre' },
]

const IDEA_CATEGORIES = [
  { en: 'Infrastructure', fr: 'Infrastructure' },
  { en: 'Environment', fr: 'Environnement' },
  { en: 'Public Transportation', fr: 'Transport public' },
  { en: 'Public Safety', fr: 'Sécurité publique' },
  { en: 'Parks & Recreation', fr: 'Parcs et loisirs' },
  { en: 'Culture & Community', fr: 'Culture et communauté' },
  { en: 'Digital Services', fr: 'Services numériques' },
  { en: 'Other', fr: 'Autre' },
]

// Matches IDEA_STATUSES in the backend ideaModel
const IDEA_STATUSES = ['open', 'under_review', 'planned', 'in_progress', 'completed', 'rejected'] as const

const translations = {
  en: {
    title: 'Community Action',
    subtitle: 'Volunteer for local cleanup tasks or join community events near you.',
    feedTab: 'Feed',
    volunteerTasksTab: 'Volunteer Tasks',
    eventsTab: 'Events',
    ideasTab: 'Ideas',
    leaderboardTab: 'Leaderboard',
    leaderboardTitle: 'Top Contributors',
    leaderboardSubtitle: 'Citizens earn points by reporting issues, getting upvotes, and completing Fix-It Challenges.',
    noLeaderboard: 'No contributors yet. Be the first to earn points!',
    points: 'pts',
    earnPoints: 'Earn',
    you: 'You',
    badgeNewcomer: 'Newcomer',
    badgeActiveCitizen: 'Active Citizen',
    badgeCivicContributor: 'Civic Contributor',
    badgeCommunityChampion: 'Community Champion',
    loading: 'Loading community activities...',
    noFeedIssues: 'No issues reported yet.',
    noFeedIssuesDesc: 'Be the first to report a local issue.',
    reportedAnIssue: 'reported an issue',
    like: 'Like',
    liked: 'Liked',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    likes: 'likes',
    issueStatuses: {
      reported: 'Reported',
      'in-progress': 'In Progress',
      assigned: 'Assigned',
      resolved: 'Resolved',
      rejected: 'Rejected',
    } as Record<string, string>,
    priorities: {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
    } as Record<string, string>,
    refresh: 'Refresh',
    createTask: 'Post Task',
    createEvent: 'Create Event',
    noTasks: 'No volunteer tasks available right now.',
    noTasksStaffHint: 'Post a task for citizens to help with, like litter cleanup or graffiti removal.',
    noEvents: 'No community events scheduled.',
    noEventsStaffHint: 'Create a clean-up drive or neighborhood watch event for the community.',
    category: 'Category',
    location: 'Location',
    volunteers: 'volunteers',
    attendees: 'attending',
    join: 'Volunteer',
    leave: 'Withdraw',
    full: 'Full',
    rsvp: 'RSVP',
    cancelRsvp: 'Cancel RSVP',
    markCompleted: 'Mark Completed',
    cancelAction: 'Cancel',
    delete: 'Delete',
    statuses: {
      open: 'Open',
      completed: 'Completed',
      cancelled: 'Cancelled',
      upcoming: 'Upcoming',
    } as Record<string, string>,
    postedBy: 'Posted by',
    organizedBy: 'Organized by',
    eventDate: 'Date & Time',
    newTaskTitle: 'Post a Volunteer Task',
    newTaskDesc: 'Ask citizens to help with a minor issue like litter cleanup or graffiti removal.',
    newEventTitle: 'Create a Community Event',
    newEventDesc: 'Organize a clean-up drive, neighborhood watch, or other community event.',
    titleLabel: 'Title',
    taskTitlePlaceholder: 'e.g., Clean up litter at Riverside Park',
    eventTitlePlaceholder: 'e.g., Riverside Park Clean-up Drive',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe what needs to be done...',
    locationPlaceholder: 'e.g., Riverside Park, Main Entrance',
    maxVolunteersLabel: 'Max Volunteers (optional)',
    maxAttendeesLabel: 'Max Attendees (optional)',
    eventDateLabel: 'Date & Time',
    submit: 'Submit',
    submitting: 'Submitting...',
    taskCreated: 'Volunteer task posted!',
    eventCreated: 'Event created!',
    createError: 'Failed to submit. Please try again.',
    actionError: 'Action failed. Please try again.',
    joinedSuccess: "You've volunteered for this task!",
    leftSuccess: "You've withdrawn from this task.",
    rsvpSuccess: "You're registered for this event!",
    cancelRsvpSuccess: 'Your RSVP has been cancelled.',
    statusUpdated: 'Status updated.',
    deleted: 'Deleted.',
    ideasSubtitle: 'Propose ideas for city improvements and vote on what matters most to your community.',
    proposeIdea: 'Propose an Idea',
    newIdeaTitle: 'Propose an Idea',
    newIdeaDesc: 'Share your idea for a city improvement or local initiative. Other citizens can discuss and vote on it.',
    ideaTitlePlaceholder: 'e.g., Add bike lanes on Main Street',
    noIdeas: 'No ideas have been proposed yet.',
    noIdeasDesc: 'Be the first to propose an idea for your community.',
    ideaStatuses: {
      open: 'Open for Discussion',
      under_review: 'Under Review',
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      rejected: 'Not Pursued',
    } as Record<string, string>,
    vote: 'Vote',
    voted: 'Voted',
    proposedBy: 'Proposed by',
    ideaCreated: 'Idea submitted!',
  },
  fr: {
    title: 'Action communautaire',
    subtitle: 'Participez à des tâches de nettoyage locales ou rejoignez des événements communautaires près de chez vous.',
    feedTab: 'Fil d\'actualité',
    volunteerTasksTab: 'Tâches bénévoles',
    eventsTab: 'Événements',
    ideasTab: 'Idées',
    leaderboardTab: 'Classement',
    leaderboardTitle: 'Meilleurs contributeurs',
    leaderboardSubtitle: 'Les citoyens gagnent des points en signalant des problèmes, en recevant des votes et en complétant des Défis Fix-It.',
    noLeaderboard: 'Aucun contributeur pour le moment. Soyez le premier à gagner des points!',
    points: 'pts',
    earnPoints: 'Gagnez',
    you: 'Vous',
    badgeNewcomer: 'Nouveau venu',
    badgeActiveCitizen: 'Citoyen actif',
    badgeCivicContributor: 'Contributeur civique',
    badgeCommunityChampion: 'Champion communautaire',
    loading: 'Chargement des activités communautaires...',
    noFeedIssues: 'Aucun problème signalé pour le moment.',
    noFeedIssuesDesc: 'Soyez le premier à signaler un problème local.',
    reportedAnIssue: 'a signalé un problème',
    like: "J'aime",
    liked: 'Aimé',
    justNow: 'À l\'instant',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'j',
    likes: 'mentions J\'aime',
    issueStatuses: {
      reported: 'Signalé',
      'in-progress': 'En cours',
      assigned: 'Assigné',
      resolved: 'Résolu',
      rejected: 'Rejeté',
    } as Record<string, string>,
    priorities: {
      low: 'Priorité faible',
      medium: 'Priorité moyenne',
      high: 'Priorité élevée',
    } as Record<string, string>,
    refresh: 'Actualiser',
    createTask: 'Publier une tâche',
    createEvent: 'Créer un événement',
    noTasks: 'Aucune tâche bénévole disponible pour le moment.',
    noTasksStaffHint: 'Publiez une tâche pour les citoyens, comme le nettoyage des déchets ou la suppression de graffitis.',
    noEvents: 'Aucun événement communautaire prévu.',
    noEventsStaffHint: 'Créez une opération de nettoyage ou une surveillance de quartier pour la communauté.',
    category: 'Catégorie',
    location: 'Emplacement',
    volunteers: 'bénévoles',
    attendees: 'participants',
    join: 'Participer',
    leave: 'Se retirer',
    full: 'Complet',
    rsvp: "S'inscrire",
    cancelRsvp: 'Annuler l\'inscription',
    markCompleted: 'Marquer comme terminé',
    cancelAction: 'Annuler',
    delete: 'Supprimer',
    statuses: {
      open: 'Ouvert',
      completed: 'Terminé',
      cancelled: 'Annulé',
      upcoming: 'À venir',
    } as Record<string, string>,
    postedBy: 'Publié par',
    organizedBy: 'Organisé par',
    eventDate: 'Date et heure',
    newTaskTitle: 'Publier une tâche bénévole',
    newTaskDesc: 'Demandez aux citoyens d\'aider pour un problème mineur comme le nettoyage des déchets ou les graffitis.',
    newEventTitle: 'Créer un événement communautaire',
    newEventDesc: 'Organisez une opération de nettoyage, une surveillance de quartier ou un autre événement communautaire.',
    titleLabel: 'Titre',
    taskTitlePlaceholder: 'ex. Nettoyer les déchets au parc Riverside',
    eventTitlePlaceholder: 'ex. Opération de nettoyage au parc Riverside',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Décrivez ce qui doit être fait...',
    locationPlaceholder: 'ex. Parc Riverside, entrée principale',
    maxVolunteersLabel: 'Bénévoles max (optionnel)',
    maxAttendeesLabel: 'Participants max (optionnel)',
    eventDateLabel: 'Date et heure',
    submit: 'Soumettre',
    submitting: 'Envoi...',
    taskCreated: 'Tâche bénévole publiée!',
    eventCreated: 'Événement créé!',
    createError: 'Échec de la soumission. Veuillez réessayer.',
    actionError: "L'action a échoué. Veuillez réessayer.",
    joinedSuccess: 'Vous vous êtes inscrit comme bénévole pour cette tâche!',
    leftSuccess: 'Vous vous êtes retiré de cette tâche.',
    rsvpSuccess: 'Vous êtes inscrit à cet événement!',
    cancelRsvpSuccess: 'Votre inscription a été annulée.',
    statusUpdated: 'Statut mis à jour.',
    deleted: 'Supprimé.',
    ideasSubtitle: 'Proposez des idées d\'amélioration pour la ville et votez pour ce qui compte le plus pour votre communauté.',
    proposeIdea: 'Proposer une idée',
    newIdeaTitle: 'Proposer une idée',
    newIdeaDesc: 'Partagez votre idée d\'amélioration pour la ville ou d\'initiative locale. Les autres citoyens peuvent en discuter et voter.',
    ideaTitlePlaceholder: 'ex. Ajouter des pistes cyclables sur la rue principale',
    noIdeas: 'Aucune idée n\'a encore été proposée.',
    noIdeasDesc: 'Soyez le premier à proposer une idée pour votre communauté.',
    ideaStatuses: {
      open: 'Ouvert à la discussion',
      under_review: 'En cours d\'examen',
      planned: 'Planifié',
      in_progress: 'En cours',
      completed: 'Terminé',
      rejected: 'Non retenu',
    } as Record<string, string>,
    vote: 'Voter',
    voted: 'Voté',
    proposedBy: 'Proposé par',
    ideaCreated: 'Idée soumise!',
  },
}

const getIdeaStatusVariant = (status: string): 'info' | 'warning' | 'secondary' | 'default' | 'success' | 'destructive' => {
  switch (status) {
    case 'open':
      return 'info'
    case 'under_review':
      return 'warning'
    case 'planned':
      return 'secondary'
    case 'in_progress':
      return 'default'
    case 'completed':
      return 'success'
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}


const getBadgeDisplay = (badge: string, t: Record<string, string>) => {
  switch (badge) {
    case 'newcomer': return t.badgeNewcomer
    case 'active_citizen': return t.badgeActiveCitizen
    case 'civic_contributor': return t.badgeCivicContributor
    case 'community_champion': return t.badgeCommunityChampion
    default: return badge
  }
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2: return <Medal className="h-5 w-5 text-gray-400" />
    case 3: return <Medal className="h-5 w-5 text-amber-700" />
    default: return <span className="text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>
  }
}

const formatTimeAgo = (iso: string, t: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string }, language: 'en' | 'fr') => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return t.justNow
  if (minutes < 60) return `${minutes}${t.minutesAgo}`
  if (hours < 24) return `${hours}${t.hoursAgo}`
  if (days < 7) return `${days}${t.daysAgo}`
  return new Date(iso).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' })
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-accecacf`

export function Community({ session, language = 'en', userRole, tempRole }: {
  session: any
  language?: 'en' | 'fr'
  userRole?: string
  tempRole?: string | null
}) {
  const t = translations[language]
  const { addToast } = useToast()
  const isStaff = userRole === 'admin' || userRole === 'technician'
  const currentUserId = session?.user?.id

  const [issues, setIssues] = useState<Issue[]>([])
  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState('')

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [taskForm, setTaskForm] = useState({ title: '', description: '', category: '', location: '', maxVolunteers: '' })
  const [eventForm, setEventForm] = useState({ title: '', description: '', category: '', location: '', eventDate: '', maxAttendees: '' })
  const [ideaForm, setIdeaForm] = useState({ title: '', description: '', category: '' })

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {}
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    if (tempRole) headers['X-Temp-Role'] = tempRole
    return headers
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [issuesRes, tasksRes, eventsRes, leaderboardRes, ideasRes] = await Promise.all([
        fetch(`${API_BASE}/issues`, { headers: authHeaders() }),
        fetch(`${API_BASE}/volunteer-tasks`, { headers: authHeaders() }),
        fetch(`${API_BASE}/events`, { headers: authHeaders() }),
        fetch(`${API_BASE}/leaderboard`, { headers: authHeaders() }),
        fetch(`${API_BASE}/ideas`, { headers: authHeaders() }),
      ])

      if (!issuesRes.ok || !tasksRes.ok || !eventsRes.ok || !leaderboardRes.ok || !ideasRes.ok) throw new Error('Failed to load community data')

      const issuesData = await issuesRes.json()
      const tasksData = await tasksRes.json()
      const eventsData = await eventsRes.json()
      const leaderboardData = await leaderboardRes.json()
      const ideasData = await ideasRes.json()

      setIssues(issuesData.issues || [])
      setTasks(tasksData.tasks || [])
      setEvents(eventsData.events || [])
      setLeaderboard(leaderboardData.leaderboard || [])
      setIdeas(ideasData.ideas || [])
    } catch (err: any) {
      console.error('Fetch community data error:', err)
      setError(err.message || 'Failed to load community data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token])

  const handleLikeIssue = async (issueId: string) => {
    try {
      setActionId(issueId)
      const res = await fetch(`${API_BASE}/issues/${issueId}/upvote`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setIssues(prev => prev.map(issue => issue.id === issueId ? data.issue : issue))
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleJoinTask = async (taskId: string) => {
    try {
      setActionId(taskId)
      const res = await fetch(`${API_BASE}/volunteer-tasks/${taskId}/join`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setTasks(prev => prev.map(task => task.id === taskId ? data.task : task))
      addToast(t.joinedSuccess, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleLeaveTask = async (taskId: string) => {
    try {
      setActionId(taskId)
      const res = await fetch(`${API_BASE}/volunteer-tasks/${taskId}/leave`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setTasks(prev => prev.map(task => task.id === taskId ? data.task : task))
      addToast(t.leftSuccess, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleTaskStatus = async (taskId: string, status: 'completed' | 'cancelled') => {
    try {
      setActionId(taskId)
      const res = await fetch(`${API_BASE}/volunteer-tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setTasks(prev => prev.map(task => task.id === taskId ? data.task : task))
      addToast(t.statusUpdated, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setActionId(taskId)
      const res = await fetch(`${API_BASE}/volunteer-tasks/${taskId}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      addToast(t.deleted, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleRsvp = async (eventId: string) => {
    try {
      setActionId(eventId)
      const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setEvents(prev => prev.map(event => event.id === eventId ? data.event : event))
      addToast(t.rsvpSuccess, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleCancelRsvp = async (eventId: string) => {
    try {
      setActionId(eventId)
      const res = await fetch(`${API_BASE}/events/${eventId}/cancel-rsvp`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setEvents(prev => prev.map(event => event.id === eventId ? data.event : event))
      addToast(t.cancelRsvpSuccess, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleEventStatus = async (eventId: string, status: 'completed' | 'cancelled') => {
    try {
      setActionId(eventId)
      const res = await fetch(`${API_BASE}/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setEvents(prev => prev.map(event => event.id === eventId ? data.event : event))
      addToast(t.statusUpdated, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setActionId(eventId)
      const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setEvents(prev => prev.filter(event => event.id !== eventId))
      addToast(t.deleted, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/volunteer-tasks`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          category: taskForm.category || 'Other',
          location: taskForm.location,
          maxVolunteers: taskForm.maxVolunteers ? Number(taskForm.maxVolunteers) : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.createError)
      setTasks(prev => [data.task, ...prev])
      setTaskDialogOpen(false)
      setTaskForm({ title: '', description: '', category: '', location: '', maxVolunteers: '' })
      addToast(t.taskCreated, 'success')
    } catch (err: any) {
      addToast(err.message || t.createError, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          category: eventForm.category || 'Other',
          location: eventForm.location,
          eventDate: eventForm.eventDate,
          maxAttendees: eventForm.maxAttendees ? Number(eventForm.maxAttendees) : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.createError)
      setEvents(prev => [...prev, data.event].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()))
      setEventDialogOpen(false)
      setEventForm({ title: '', description: '', category: '', location: '', eventDate: '', maxAttendees: '' })
      addToast(t.eventCreated, 'success')
    } catch (err: any) {
      addToast(err.message || t.createError, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVoteIdea = async (ideaId: string) => {
    try {
      setActionId(ideaId)
      const res = await fetch(`${API_BASE}/ideas/${ideaId}/vote`, { method: 'POST', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setIdeas(prev => prev.map(idea => idea.id === ideaId ? data.idea : idea))
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleIdeaStatus = async (ideaId: string, status: string) => {
    try {
      setActionId(ideaId)
      const res = await fetch(`${API_BASE}/ideas/${ideaId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setIdeas(prev => prev.map(idea => idea.id === ideaId ? data.idea : idea))
      addToast(t.statusUpdated, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      setActionId(ideaId)
      const res = await fetch(`${API_BASE}/ideas/${ideaId}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.actionError)
      setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
      addToast(t.deleted, 'success')
    } catch (err: any) {
      addToast(err.message || t.actionError, 'error')
    } finally {
      setActionId('')
    }
  }

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/ideas`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ideaForm.title,
          description: ideaForm.description,
          category: ideaForm.category || 'Other',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t.createError)
      setIdeas(prev => [data.idea, ...prev])
      setIdeaDialogOpen(false)
      setIdeaForm({ title: '', description: '', category: '' })
      addToast(t.ideaCreated, 'success')
    } catch (err: any) {
      addToast(err.message || t.createError, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-destructive" />
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
              {t.refresh}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 sm:inline-flex sm:w-auto">
          <TabsTrigger value="feed" className="gap-1.5">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">{t.feedTab}</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <HandHeart className="h-4 w-4" />
            <span className="hidden sm:inline">{t.volunteerTasksTab}</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{t.eventsTab}</span>
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ideasTab}</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">{t.leaderboardTab}</span>
          </TabsTrigger>
        </TabsList>

          {/* Issue Feed */}
          <TabsContent value="feed" className="space-y-4">
            {issues.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>{t.noFeedIssues}</p>
                  <p className="text-sm mt-1">{t.noFeedIssuesDesc}</p>
                </CardContent>
              </Card>
            ) : (
              issues.map((issue) => {
                const hasLiked = !!currentUserId && (issue.upvotedBy || []).includes(currentUserId)
                return (
                  <Card key={issue.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                              {(issue.reporterName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{issue.reporterName}</span>
                              <span> {t.reportedAnIssue}</span>
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(issue.reportedAt, t, language)}
                              </div>
                            </div>
                          </div>
                          <CardTitle>{issue.title}</CardTitle>
                          <CardDescription>{issue.description}</CardDescription>
                        </div>
                        <StatusBadge kind="status" value={issue.status} label={t.issueStatuses[issue.status] || issue.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {issue.photoUrl && (
                        <img
                          src={issue.photoUrl}
                          alt={issue.title}
                          className="w-full max-h-96 object-cover rounded-xl border border-border"
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{issue.category}</Badge>
                        <StatusBadge kind="priority" value={issue.priority} label={t.priorities[issue.priority] || issue.priority} />
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {issue.location}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        <Button
                          size="sm"
                          variant={hasLiked ? 'default' : 'outline'}
                          onClick={() => handleLikeIssue(issue.id)}
                          disabled={actionId === issue.id}
                        >
                          {actionId === issue.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-4 w-4" />
                          )}
                          {hasLiked ? t.liked : t.like} ({issue.upvotes || 0})
                        </Button>
                        <Comments entityType="issue" entityId={issue.id} session={session} language={language} tempRole={tempRole} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Volunteer Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            {isStaff && (
              <div className="flex justify-end">
                <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      {t.createTask}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.newTaskTitle}</DialogTitle>
                      <DialogDescription>{t.newTaskDesc}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">{t.titleLabel} *</Label>
                        <Input
                          id="task-title"
                          required
                          placeholder={t.taskTitlePlaceholder}
                          value={taskForm.title}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">{t.descriptionLabel} *</Label>
                        <Textarea
                          id="task-description"
                          required
                          rows={3}
                          placeholder={t.descriptionPlaceholder}
                          value={taskForm.description}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.category}</Label>
                          <Select value={taskForm.category} onValueChange={(value) => setTaskForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder={t.category} />
                            </SelectTrigger>
                            <SelectContent>
                              {VOLUNTEER_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.en} value={cat.en}>
                                  {language === 'fr' ? cat.fr : cat.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-max-volunteers">{t.maxVolunteersLabel}</Label>
                          <Input
                            id="task-max-volunteers"
                            type="number"
                            min={1}
                            value={taskForm.maxVolunteers}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, maxVolunteers: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-location">{t.location} *</Label>
                        <Input
                          id="task-location"
                          required
                          placeholder={t.locationPlaceholder}
                          value={taskForm.location}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {submitting ? t.submitting : t.submit}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <HandHeart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>{t.noTasks}</p>
                  {isStaff && <p className="text-sm mt-1">{t.noTasksStaffHint}</p>}
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => {
                const hasJoined = !!currentUserId && task.volunteers.some(v => v.userId === currentUserId)
                const isFull = !!task.maxVolunteers && task.volunteers.length >= task.maxVolunteers
                return (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle>{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <div className="flex sm:flex-col items-start sm:items-end gap-1">
                          <StatusBadge kind="taskEvent" value={task.status} label={t.statuses[task.status] || task.status} />
                          <Badge variant="outline" className="whitespace-nowrap">
                            <Award className="h-3 w-3 text-warning" />
                            {t.earnPoints} {TASK_COMPLETION_POINTS} {t.points}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{task.category}</Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {task.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {task.volunteers.length}{task.maxVolunteers ? `/${task.maxVolunteers}` : ''} {t.volunteers}
                        </span>
                        <span>{t.postedBy}: {task.createdByName}</span>
                      </div>

                      {task.volunteers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.volunteers.map(v => (
                            <Badge key={v.userId} variant="secondary" className="text-xs">
                              {v.userName}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        {!isStaff && task.status === 'open' && (
                          hasJoined ? (
                            <Button size="sm" variant="outline" onClick={() => handleLeaveTask(task.id)} disabled={actionId === task.id}>
                              {actionId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              {t.leave}
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleJoinTask(task.id)} disabled={actionId === task.id || isFull}>
                              {actionId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandHeart className="h-4 w-4" />}
                              {isFull ? t.full : t.join}
                            </Button>
                          )
                        )}

                        {isStaff && task.status === 'open' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleTaskStatus(task.id, 'completed')} disabled={actionId === task.id}>
                              <CheckCircle className="h-4 w-4" />
                              {t.markCompleted}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleTaskStatus(task.id, 'cancelled')} disabled={actionId === task.id}>
                              <XCircle className="h-4 w-4" />
                              {t.cancelAction}
                            </Button>
                          </>
                        )}

                        {isStaff && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={actionId === task.id}
                            title={t.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Community Events */}
          <TabsContent value="events" className="space-y-4">
            {isStaff && (
              <div className="flex justify-end">
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      {t.createEvent}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.newEventTitle}</DialogTitle>
                      <DialogDescription>{t.newEventDesc}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">{t.titleLabel} *</Label>
                        <Input
                          id="event-title"
                          required
                          placeholder={t.eventTitlePlaceholder}
                          value={eventForm.title}
                          onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-description">{t.descriptionLabel} *</Label>
                        <Textarea
                          id="event-description"
                          required
                          rows={3}
                          placeholder={t.descriptionPlaceholder}
                          value={eventForm.description}
                          onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.category}</Label>
                          <Select value={eventForm.category} onValueChange={(value) => setEventForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder={t.category} />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.en} value={cat.en}>
                                  {language === 'fr' ? cat.fr : cat.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-max-attendees">{t.maxAttendeesLabel}</Label>
                          <Input
                            id="event-max-attendees"
                            type="number"
                            min={1}
                            value={eventForm.maxAttendees}
                            onChange={(e) => setEventForm(prev => ({ ...prev, maxAttendees: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-location">{t.location} *</Label>
                          <Input
                            id="event-location"
                            required
                            placeholder={t.locationPlaceholder}
                            value={eventForm.location}
                            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-date">{t.eventDateLabel} *</Label>
                          <Input
                            id="event-date"
                            type="datetime-local"
                            required
                            value={eventForm.eventDate}
                            onChange={(e) => setEventForm(prev => ({ ...prev, eventDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {submitting ? t.submitting : t.submit}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>{t.noEvents}</p>
                  {isStaff && <p className="text-sm mt-1">{t.noEventsStaffHint}</p>}
                </CardContent>
              </Card>
            ) : (
              events.map((event) => {
                const hasRsvped = !!currentUserId && event.attendees.some(a => a.userId === currentUserId)
                const isFull = !!event.maxAttendees && event.attendees.length >= event.maxAttendees
                return (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>{event.description}</CardDescription>
                        </div>
                        <StatusBadge kind="taskEvent" value={event.status} label={t.statuses[event.status] || event.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{event.category}</Badge>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateTime(event.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.attendees.length}{event.maxAttendees ? `/${event.maxAttendees}` : ''} {t.attendees}
                        </span>
                        <span>{t.organizedBy}: {event.createdByName}</span>
                      </div>

                      {event.attendees.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.attendees.map(a => (
                            <Badge key={a.userId} variant="secondary" className="text-xs">
                              {a.userName}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        {!isStaff && event.status === 'upcoming' && (
                          hasRsvped ? (
                            <Button size="sm" variant="outline" onClick={() => handleCancelRsvp(event.id)} disabled={actionId === event.id}>
                              {actionId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              {t.cancelRsvp}
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleRsvp(event.id)} disabled={actionId === event.id || isFull}>
                              {actionId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                              {isFull ? t.full : t.rsvp}
                            </Button>
                          )
                        )}

                        {isStaff && event.status === 'upcoming' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEventStatus(event.id, 'completed')} disabled={actionId === event.id}>
                              <CheckCircle className="h-4 w-4" />
                              {t.markCompleted}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEventStatus(event.id, 'cancelled')} disabled={actionId === event.id}>
                              <XCircle className="h-4 w-4" />
                              {t.cancelAction}
                            </Button>
                          </>
                        )}

                        {isStaff && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={actionId === event.id}
                            title={t.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Community Ideas */}
          <TabsContent value="ideas" className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.ideasSubtitle}</p>

            {session?.access_token && (
              <div className="flex justify-end">
                <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      {t.proposeIdea}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.newIdeaTitle}</DialogTitle>
                      <DialogDescription>{t.newIdeaDesc}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateIdea} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="idea-title">{t.titleLabel} *</Label>
                        <Input
                          id="idea-title"
                          required
                          placeholder={t.ideaTitlePlaceholder}
                          value={ideaForm.title}
                          onChange={(e) => setIdeaForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idea-description">{t.descriptionLabel} *</Label>
                        <Textarea
                          id="idea-description"
                          required
                          rows={3}
                          placeholder={t.descriptionPlaceholder}
                          value={ideaForm.description}
                          onChange={(e) => setIdeaForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.category}</Label>
                        <Select value={ideaForm.category} onValueChange={(value) => setIdeaForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.category} />
                          </SelectTrigger>
                          <SelectContent>
                            {IDEA_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.en} value={cat.en}>
                                {language === 'fr' ? cat.fr : cat.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {submitting ? t.submitting : t.submit}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {ideas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>{t.noIdeas}</p>
                  <p className="text-sm mt-1">{t.noIdeasDesc}</p>
                </CardContent>
              </Card>
            ) : (
              ideas.map((idea) => {
                const hasVoted = !!currentUserId && (idea.upvotedBy || []).includes(currentUserId)
                const canDelete = isStaff || idea.createdBy === currentUserId
                return (
                  <Card key={idea.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle>{idea.title}</CardTitle>
                          <CardDescription>{idea.description}</CardDescription>
                        </div>
                        <Badge variant={getIdeaStatusVariant(idea.status)}>{t.ideaStatuses[idea.status] || idea.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{idea.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTimeAgo(idea.createdAt, t, language)}
                        </span>
                        <span>{t.proposedBy}: {idea.createdByName}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                        <Button
                          size="sm"
                          variant={hasVoted ? 'default' : 'outline'}
                          onClick={() => handleVoteIdea(idea.id)}
                          disabled={actionId === idea.id || !session?.access_token}
                        >
                          {actionId === idea.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowBigUp className="h-4 w-4" />
                          )}
                          {hasVoted ? t.voted : t.vote} ({idea.upvotes || 0})
                        </Button>

                        <Comments entityType="idea" entityId={idea.id} session={session} language={language} tempRole={tempRole} />

                        {isStaff && (
                          <Select value={idea.status} onValueChange={(value) => handleIdeaStatus(idea.id, value)}>
                            <SelectTrigger className="h-8 w-auto text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {IDEA_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t.ideaStatuses[status] || status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => handleDeleteIdea(idea.id)}
                            disabled={actionId === idea.id}
                            title={t.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t.leaderboardTitle}
                </CardTitle>
                <CardDescription>{t.leaderboardSubtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Trophy className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>{t.noLeaderboard}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry) => {
                      const isCurrentUser = !!currentUserId && entry.userId === currentUserId
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            isCurrentUser ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-center w-6">{getRankIcon(entry.rank)}</div>
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={entry.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                              {(entry.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">{entry.name}</span>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">{t.you}</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{getBadgeDisplay(entry.badge, t)}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-foreground">{entry.points}</div>
                            <div className="text-xs text-muted-foreground">{t.points}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}

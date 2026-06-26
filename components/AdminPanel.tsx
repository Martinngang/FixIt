
import { useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { CredibilityBadge } from "./ui/credibility-badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./ui/empty-state";
import { StatusBadge } from "./ui/status-badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Settings,
  Clock,
  MapPin,
  User,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  UserPlus,
  Trash2,
  Wrench,
  Send,
  Bell,
  Shield,
  Eye,
  ThumbsUp,
  AlertTriangle,
  MessageSquare,
  Flame,
  Wifi,
  Coffee,
  Moon,
  Navigation,
  Sparkles,
  Loader2,
  Building2,
  RefreshCw,
  Plus,
  X,
  Store,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Comments } from "./Comments";
// import './index.css';

const issueCategories = [
  'Road & Transportation',
  'Water & Utilities',
  'Parks & Recreation',
  'Public Safety',
  'Waste Management',
  'Street Lighting',
  'Public Buildings',
  'Environmental',
  'Other'
]

const translations = {
  en: {
    adminPanel: "Admin Panel",
    issueManagement: "Issue Management",
    userManagement: "User Management",
    notifications: "Send Notifications",
    subtitle: "Manage and update the status of reported issues",
    usersSubtitle: "Manage user accounts and assign roles",
    notificationsSubtitle:
      "Send notifications to users and technicians",
    refreshIssues: "Refresh Issues",
    refreshUsers: "Refresh Users",
    noIssuesTitle: "No Issues to Manage",
    noIssuesDesc: "No issues have been reported yet",
    noUsersTitle: "No Users Found",
    noUsersDesc: "No users are registered in the system",
    update: "Update",
    updateIssueStatus: "Update Issue Status",
    updateDesc:
      "Change the status and add an admin note for this issue.",
    assignTechnician: "Assign Technician",
    assignDesc:
      "Assign this issue to a technician for resolution.",
    status: "Status",
    selectStatus: "Select status",
    selectTechnician: "Select technician",
    adminNote: "Admin Note (Optional)",
    adminNotePlaceholder:
      "Add a note about this issue or status change...",
    currentAdminNote: "Current Admin Note:",
    cancel: "Cancel",
    updating: "Updating...",
    assigning: "Assigning...",
    updateIssue: "Update Issue",
    assignIssue: "Assign Issue",
    category: "Category",
    lastUpdated: "Last updated",
    location: "Location",
    reportedBy: "Reported by",
    assignedTo: "Assigned to",
    unassigned: "Unassigned",
    // User Management
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    userName: "Name",
    userEmail: "Email",
    userRole: "Role",
    userStatus: "Status",
    active: "Active",
    inactive: "Inactive",
    citizen: "Citizen",
    technician: "Technician",
    admin: "Administrator",
    orgAdminRole: "Organisation Admin",
    contractorRole: "Contractor",
    categories: "Categories",
    selectCategories: "Select categories for this technician",
    joinedOn: "Joined on",
    lastSeen: "Last seen",
    actions: "Actions",
    addNewUser: "Add New User",
    editUserDetails: "Edit User Details",
    confirmDelete: "Confirm Delete",
    deleteUserConfirm:
      "Are you sure you want to delete this user? This action cannot be undone.",
    userNamePlaceholder: "Enter full name",
    userEmailPlaceholder: "Enter email address",
    save: "Save",
    saving: "Saving...",
    deleting: "Deleting...",
    // Notifications
    sendNotification: "Send Notification",
    notificationTitle: "Notification Title",
    notificationMessage: "Message",
    notificationTitlePlaceholder: "Enter notification title",
    notificationMessagePlaceholder: "Enter your message...",
    recipientType: "Send to",
    allUsers: "All Users",
    allTechnicians: "All Technicians",
    allCitizens: "All Citizens",
    specificUser: "Specific User",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    sendToAll: "Send Notification",
    sending: "Sending...",
    notificationSent: "Notification sent successfully",
    composeTab: "Compose",
    historyTab: "History",
    sentTo: "Sent to",
    recipientsCount: "recipients",
    noSentHistory: "No notifications sent yet",
    noSentHistoryDesc: "Notifications you send will appear here",
    loadingHistory: "Loading history...",
    sortBy: "Sort by",
    sortRecent: "Most Recent",
    sortUpvotes: "Most Upvoted",
    sortFlagged: "Needs Attention",
    sortCredibility: "Lowest Credibility",
    needsAttention: "Needs Attention",
    hotspots: "Hotspots",
    hotspotsSubtitle: "Recurring problem locations that may need proactive maintenance",
    refreshHotspots: "Refresh Hotspots",
    noHotspotsTitle: "No Hotspots Detected",
    noHotspotsDesc: "Locations need at least 2 reported issues to appear here",
    topCategory: "Top category",
    totalIssuesLabel: "issues",
    recentIssuesLabel: "Recent (90 days)",
    avgResolution: "Avg. resolution time",
    days: "days",
    suggestedTechnicians: "Suggested Technicians",
    suggestedTechniciansDesc: "Ranked by skill match, availability, distance, and current workload.",
    loadingSuggestions: "Finding the best technicians...",
    noSuggestions: "No technicians found",
    matchScore: "Match",
    skillMatch: "Skill match",
    available: "Available",
    busy: "Busy",
    offDuty: "Off duty",
    away: "away",
    activeTasks: "active tasks",
    distanceUnknown: "Distance unknown",
    // Organization
    organization: "Organization",
    organizationSubtitle: "Configure your organization's issue categories, location label, and join code",
    orgCategories: "Issue Categories",
    orgCategoriesDesc: "These categories appear when your members report an issue",
    newCategoryPlaceholder: "New category name",
    addCategory: "Add",
    removeCategoryAria: "Remove category",
    orgLocationLabel: "Location Field Label",
    orgLocationLabelDesc: "Shown to members instead of an address field, e.g. \"Building / Room / Asset ID\"",
    orgLocationLabelPlaceholder: "Building / Room / Asset ID",
    joinCode: "Join Code",
    regenerateCode: "Regenerate",
    joinCodeHint: "Share this code with your team so they can join your organization.",
    billingTitle: "Billing & Plan",
    billingDesc: "Manage your organization's subscription and member seats.",
    planFree: "Free",
    planPro: "Pro",
    planEnterprise: "Enterprise",
    seatsUsedLabel: "{used} / {limit} seats used",
    seatsUsedUnlimited: "{used} seats used (unlimited)",
    subscriptionStatusActive: "Active",
    subscriptionStatusPastDue: "Payment past due",
    subscriptionStatusCanceled: "Canceled",
    upgradeToPro: "Upgrade to Pro",
    upgradeToEnterprise: "Upgrade to Enterprise",
    upgrading: "Redirecting...",
    manageBilling: "Manage Billing",
    openingPortal: "Opening...",
    billingCheckoutError: "Failed to start checkout",
    billingPortalError: "Failed to open billing portal",
    billingUpgradeSuccessToast: "Subscription updated! Refreshing your plan...",
    billingUpgradeCancelledToast: "Upgrade cancelled.",
    saveOrganization: "Save Changes",
    orgUpdateSuccess: "Organization updated successfully",
    orgUpdateError: "Failed to update organization",
    orgRegenerateError: "Failed to regenerate join code",
    orgFetchError: "Failed to load organization",
    atLeastOneCategory: "At least one category is required",
    // Marketplace (Phase 11)
    marketplaceLabel: "Marketplace",
    postToMarketplace: "Post to Marketplace",
    postToMarketplaceDesc: "Make this issue available for independent contractors to claim. Set a fixed budget for the job.",
    marketplaceBudgetLabel: "Budget (USD)",
    marketplaceBudgetPlaceholder: "e.g. 150",
    posting: "Posting...",
    post: "Post",
    cancelPosting: "Cancel Posting",
    payContractor: "Pay Contractor",
    paying: "Processing...",
    marketplaceStatusOpen: "Open",
    marketplaceStatusClaimed: "Claimed",
    marketplaceStatusCompleted: "Awaiting Payment",
    marketplaceStatusPaid: "Paid",
    postSuccess: "Issue posted to the marketplace",
    postError: "Failed to post issue to marketplace",
    unpostSuccess: "Marketplace posting cancelled",
    unpostError: "Failed to cancel marketplace posting",
    viaSms: "Via SMS",
    syncPayment: "Refresh Payment Status",
    syncingPayment: "Checking...",
    syncPaymentError: "Failed to refresh payment status",
    paymentSuccessToast: "Payment completed! Syncing status...",
    paymentCancelledToast: "Payment was cancelled. You can try again when ready.",
    payError: "Failed to start payment",
    invalidBudget: "Enter a valid budget greater than 0",
    contractorVetting: "Contractor Vetting",
    contractorVettingSubtitle: "Review and approve independent contractor applications",
    noContractorApplications: "No contractor applications",
    noContractorApplicationsDesc: "Applications from independent contractors will appear here",
    approve: "Approve",
    reject: "Reject",
    contractorApprovedSuccess: "Contractor approved",
    contractorRejectedSuccess: "Contractor rejected",
    contractorStatusError: "Failed to update contractor status",
    stripeConnected: "Stripe connected",
    stripeNotConnected: "Stripe not connected",
    applicationPending: "Pending",
    applicationApproved: "Approved",
    applicationRejected: "Rejected",
    refresh: "Refresh",
  },
  fr: {
    adminPanel: "Panneau admin",
    issueManagement: "Gestion des problèmes",
    userManagement: "Gestion des utilisateurs",
    notifications: "Envoyer des notifications",
    subtitle:
      "Gérer et mettre à jour le statut des problèmes signalés",
    usersSubtitle:
      "Gérer les comptes utilisateurs et assigner les rôles",
    notificationsSubtitle:
      "Envoyer des notifications aux utilisateurs et techniciens",
    refreshIssues: "Actualiser les problèmes",
    refreshUsers: "Actualiser les utilisateurs",
    noIssuesTitle: "Aucun problème à gérer",
    noIssuesDesc: "Aucun problème n'a encore été signalé",
    noUsersTitle: "Aucun utilisateur trouvé",
    noUsersDesc:
      "Aucun utilisateur n'est enregistré dans le système",
    update: "Mettre à jour",
    updateIssueStatus: "Mettre à jour le statut du problème",
    updateDesc:
      "Changer le statut et ajouter une note admin pour ce problème.",
    assignTechnician: "Assigner un technicien",
    assignDesc:
      "Assigner ce problème à un technicien pour résolution.",
    status: "Statut",
    selectStatus: "Sélectionner le statut",
    selectTechnician: "Sélectionner un technicien",
    adminNote: "Note admin (Optionnel)",
    adminNotePlaceholder:
      "Ajouter une note sur ce problème ou changement de statut...",
    currentAdminNote: "Note admin actuelle:",
    cancel: "Annuler",
    updating: "Mise à jour...",
    assigning: "Attribution...",
    updateIssue: "Mettre à jour le problème",
    assignIssue: "Assigner le problème",
    category: "Catégorie",
    lastUpdated: "Dernière mise à jour",
    location: "Emplacement",
    reportedBy: "Signalé par",
    assignedTo: "Assigné à",
    unassigned: "Non assigné",
    // User Management
    addUser: "Ajouter un utilisateur",
    editUser: "Modifier l'utilisateur",
    deleteUser: "Supprimer l'utilisateur",
    userName: "Nom",
    userEmail: "Email",
    userRole: "Rôle",
    userStatus: "Statut",
    active: "Actif",
    inactive: "Inactif",
    citizen: "Citoyen",
    technician: "Technicien",
    admin: "Administrateur",
    orgAdminRole: "Administrateur d'organisation",
    contractorRole: "Entrepreneur",
    categories: "Catégories",
    selectCategories: "Sélectionner les catégories pour ce technicien",
    joinedOn: "Inscrit le",
    lastSeen: "Dernière connexion",
    actions: "Actions",
    addNewUser: "Ajouter un nouvel utilisateur",
    editUserDetails: "Modifier les détails de l'utilisateur",
    confirmDelete: "Confirmer la suppression",
    deleteUserConfirm:
      "Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action ne peut pas être annulée.",
    userNamePlaceholder: "Entrez le nom complet",
    userEmailPlaceholder: "Entrez l'adresse email",
    save: "Enregistrer",
    saving: "Enregistrement...",
    deleting: "Suppression...",
    // Notifications
    sendNotification: "Envoyer une notification",
    notificationTitle: "Titre de la notification",
    notificationMessage: "Message",
    notificationTitlePlaceholder:
      "Entrez le titre de la notification",
    notificationMessagePlaceholder: "Entrez votre message...",
    recipientType: "Envoyer à",
    allUsers: "Tous les utilisateurs",
    allTechnicians: "Tous les techniciens",
    allCitizens: "Tous les citoyens",
    specificUser: "Utilisateur spécifique",
    priority: "Priorité",
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
    sendToAll: "Envoyer la notification",
    sending: "Envoi...",
    composeTab: "Composer",
    historyTab: "Historique",
    sentTo: "Envoyé à",
    recipientsCount: "destinataires",
    noSentHistory: "Aucune notification envoyée",
    noSentHistoryDesc: "Les notifications que vous envoyez apparaîtront ici",
    loadingHistory: "Chargement de l'historique...",
    notificationSent: "Notification envoyée avec succès",
    sortBy: "Trier par",
    sortRecent: "Plus récent",
    sortUpvotes: "Plus voté",
    sortFlagged: "Nécessite une attention",
    sortCredibility: "Crédibilité la plus faible",
    needsAttention: "Nécessite une attention",
    hotspots: "Points chauds",
    hotspotsSubtitle: "Emplacements à problèmes récurrents pouvant nécessiter une maintenance proactive",
    refreshHotspots: "Actualiser les points chauds",
    noHotspotsTitle: "Aucun point chaud détecté",
    noHotspotsDesc: "Les emplacements doivent avoir au moins 2 problèmes signalés pour apparaître ici",
    topCategory: "Catégorie principale",
    totalIssuesLabel: "problèmes",
    recentIssuesLabel: "Récents (90 jours)",
    avgResolution: "Temps de résolution moyen",
    days: "jours",
    suggestedTechnicians: "Techniciens suggérés",
    suggestedTechniciansDesc: "Classés par compétences, disponibilité, distance et charge de travail actuelle.",
    loadingSuggestions: "Recherche des meilleurs techniciens...",
    noSuggestions: "Aucun technicien trouvé",
    matchScore: "Correspondance",
    skillMatch: "Compétence",
    available: "Disponible",
    busy: "Occupé",
    offDuty: "Hors service",
    away: "de distance",
    activeTasks: "tâches actives",
    distanceUnknown: "Distance inconnue",
    // Organization
    organization: "Organisation",
    organizationSubtitle: "Configurez les catégories de problèmes, le libellé de localisation et le code d'invitation de votre organisation",
    orgCategories: "Catégories de problèmes",
    orgCategoriesDesc: "Ces catégories apparaissent lorsque vos membres signalent un problème",
    newCategoryPlaceholder: "Nom de la nouvelle catégorie",
    addCategory: "Ajouter",
    removeCategoryAria: "Supprimer la catégorie",
    orgLocationLabel: "Libellé du champ de localisation",
    orgLocationLabelDesc: "Affiché aux membres à la place d'un champ d'adresse, par ex. \"Bâtiment / Salle / ID de l'actif\"",
    orgLocationLabelPlaceholder: "Bâtiment / Salle / ID de l'actif",
    joinCode: "Code d'invitation",
    regenerateCode: "Régénérer",
    joinCodeHint: "Partagez ce code avec votre équipe pour qu'elle rejoigne votre organisation.",
    billingTitle: "Facturation et forfait",
    billingDesc: "Gérez l'abonnement de votre organisation et les places membres.",
    planFree: "Gratuit",
    planPro: "Pro",
    planEnterprise: "Entreprise",
    seatsUsedLabel: "{used} / {limit} places utilisées",
    seatsUsedUnlimited: "{used} places utilisées (illimité)",
    subscriptionStatusActive: "Actif",
    subscriptionStatusPastDue: "Paiement en retard",
    subscriptionStatusCanceled: "Annulé",
    upgradeToPro: "Passer à Pro",
    upgradeToEnterprise: "Passer à Entreprise",
    upgrading: "Redirection...",
    manageBilling: "Gérer la facturation",
    openingPortal: "Ouverture...",
    billingCheckoutError: "Échec du démarrage du paiement",
    billingPortalError: "Échec de l'ouverture du portail de facturation",
    billingUpgradeSuccessToast: "Abonnement mis à jour! Actualisation de votre forfait...",
    billingUpgradeCancelledToast: "Mise à niveau annulée.",
    saveOrganization: "Enregistrer les modifications",
    orgUpdateSuccess: "Organisation mise à jour avec succès",
    orgUpdateError: "Échec de la mise à jour de l'organisation",
    orgRegenerateError: "Échec de la régénération du code",
    orgFetchError: "Échec du chargement de l'organisation",
    atLeastOneCategory: "Au moins une catégorie est requise",
    // Marketplace (Phase 11)
    marketplaceLabel: "Marché",
    postToMarketplace: "Publier sur le marché",
    postToMarketplaceDesc: "Rendre ce problème disponible pour que des entrepreneurs indépendants le réclament. Définissez un budget fixe pour ce travail.",
    marketplaceBudgetLabel: "Budget (USD)",
    marketplaceBudgetPlaceholder: "ex. 150",
    posting: "Publication...",
    post: "Publier",
    cancelPosting: "Annuler la publication",
    payContractor: "Payer l'entrepreneur",
    paying: "Traitement...",
    marketplaceStatusOpen: "Ouvert",
    marketplaceStatusClaimed: "Réclamé",
    marketplaceStatusCompleted: "En attente de paiement",
    marketplaceStatusPaid: "Payé",
    postSuccess: "Problème publié sur le marché",
    postError: "Échec de la publication sur le marché",
    unpostSuccess: "Publication annulée",
    unpostError: "Échec de l'annulation de la publication",
    viaSms: "Par SMS",
    syncPayment: "Actualiser le statut du paiement",
    syncingPayment: "Vérification...",
    syncPaymentError: "Échec de l'actualisation du statut du paiement",
    paymentSuccessToast: "Paiement terminé! Synchronisation du statut...",
    paymentCancelledToast: "Le paiement a été annulé. Vous pouvez réessayer quand vous êtes prêt.",
    payError: "Échec du démarrage du paiement",
    invalidBudget: "Entrez un budget valide supérieur à 0",
    contractorVetting: "Vérification des entrepreneurs",
    contractorVettingSubtitle: "Examiner et approuver les candidatures d'entrepreneurs indépendants",
    noContractorApplications: "Aucune candidature d'entrepreneur",
    noContractorApplicationsDesc: "Les candidatures des entrepreneurs indépendants apparaîtront ici",
    approve: "Approuver",
    reject: "Rejeter",
    contractorApprovedSuccess: "Entrepreneur approuvé",
    contractorRejectedSuccess: "Entrepreneur rejeté",
    contractorStatusError: "Échec de la mise à jour du statut de l'entrepreneur",
    stripeConnected: "Stripe connecté",
    stripeNotConnected: "Stripe non connecté",
    applicationPending: "En attente",
    applicationApproved: "Approuvé",
    applicationRejected: "Rejeté",
    refresh: "Actualiser",
  },
};

interface MarketplaceInfo {
  status: "open" | "claimed" | "completed" | "paid";
  budget: number;
  commissionRate: number;
  postedBy: string;
  postedAt: string;
  contractorId?: string;
  contractorName?: string;
  claimedAt?: string;
  completedAt?: string;
  transactionId?: string;
  paidAt?: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: "low" | "medium" | "high";
  status: "reported" | "in-progress" | "resolved" | "rejected";
  reportedBy: string;
  reporterName: string;
  reportedAt: string;
  updatedAt: string;
  adminNote?: string;
  photoUrl?: string;
  coordinates?: { lat: number; lng: number };
  assignedTechnician?: string;
  assignedTechnicianName?: string;
  upvotes?: number;
  upvotedBy?: string[];
  sentiment?: string;
  flagged?: boolean;
  credibilityScore?: number;
  credibilityLevel?: "high" | "medium" | "low";
  credibilitySignals?: {
    hasPhoto: boolean;
    hasCoordinates: boolean;
    descriptionLength: number;
    corroboratingReports: number;
    upvotes: number;
    reporterRejectionRate: number | null;
  };
  marketplace?: MarketplaceInfo;
  reportedVia?: "app" | "sms";
  reporterPhone?: string;
}

interface ContractorApplication {
  id: string;
  email: string;
  name: string;
  categories: string[];
  marketplaceStatus: "pending" | "approved" | "rejected";
  stripeOnboardingComplete: boolean;
}

interface TechnicianSuggestion {
  technicianId: string;
  name: string;
  email: string;
  categories: string[];
  availability: "available" | "busy" | "off_duty";
  location: { lat: number; lng: number } | null;
  distanceKm: number | null;
  activeAssignments: number;
  skillMatch: boolean;
  score: number;
}

interface Hotspot {
  location: string;
  totalIssues: number;
  recentIssues: number;
  flaggedIssues: number;
  topCategory: string;
  categories: Record<string, number>;
  avgResolutionDays: number | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "technician" | "admin";
  status: "active" | "inactive";
  categories: string[];
  createdAt: string;
  lastSeenAt?: string;
  organizationId?: string | null;
  marketplaceStatus?: "pending" | "approved" | "rejected" | null;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  categories?: string[];
  locationLabel?: string;
  joinCode?: string;
  planId?: "free" | "pro" | "enterprise";
  subscriptionStatus?: "active" | "past_due" | "canceled";
}

interface BillingInfo {
  planId: "free" | "pro" | "enterprise";
  subscriptionStatus: "active" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  seatsUsed: number;
  seatLimit: number | null;
  hasBillingAccount: boolean;
}

type BadgeVariant =
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "secondary"
  | "default"
  | "outline";

const statusOptions = [
  {
    value: "reported",
    label: "Reported",
    icon: AlertCircle,
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Clock,
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: XCircle,
  },
];


const getRoleVariant = (role: string): BadgeVariant => {
  switch (role) {
    case "admin":
      return "default";
    case "technician":
      return "info";
    case "citizen":
      return "success";
    default:
      return "secondary";
  }
};

const getAvailabilityInfo = (availability: string) => {
  switch (availability) {
    case "available":
      return { icon: Wifi, color: "text-success" };
    case "busy":
      return { icon: Coffee, color: "text-warning" };
    default:
      return { icon: Moon, color: "text-muted-foreground" };
  }
};

const getScoreVariant = (score: number): BadgeVariant => {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "destructive";
};

export function AdminPanel({
  session,
  language = "en",
  defaultView = "issues",
  tempRole,
}: {
  session: any;
  language?: "en" | "fr";
  defaultView?: "issues" | "users" | "notifications";
  tempRole?: string | null;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issueSort, setIssueSort] = useState<"recent" | "upvotes" | "flagged" | "credibility">("recent");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [hotspotsLoading, setHotspotsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState("");
  const [selectedIssue, setSelectedIssue] =
    useState<Issue | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState("");
  const [selectedTechnician, setSelectedTechnician] =
    useState("");
  const [adminNote, setAdminNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] =
    useState(false);
  const [suggestions, setSuggestions] = useState<TechnicianSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] =
    useState(false);

  // User form
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen" as "citizen" | "technician" | "admin",
    status: "active" as "active" | "inactive",
    categories: [] as string[],
  });

  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    recipientType: "all",
    specificUserId: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [notificationTab, setNotificationTab] = useState<"compose" | "history">("compose");
  const [sentNotifications, setSentNotifications] = useState<
    { id: string; title: string; message: string; priority: string; target: string; recipientCount: number; createdAt: string }[]
  >([]);
  const [sentNotificationsLoading, setSentNotificationsLoading] = useState(false);

  // Organization
  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined);
  const [orgCategories, setOrgCategories] = useState<string[]>([]);
  const [orgLocationLabel, setOrgLocationLabel] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  // Marketplace (Phase 11)
  const [marketplaceDialogOpen, setMarketplaceDialogOpen] = useState(false);
  const [marketplaceBudget, setMarketplaceBudget] = useState("");
  const [marketplaceLoading, setMarketplaceLoading] = useState("");
  const [contractors, setContractors] = useState<ContractorApplication[]>([]);
  const [contractorsLoading, setContractorsLoading] = useState(false);
  const [contractorActionLoading, setContractorActionLoading] = useState("");

  const t = translations[language];
  const { addToast } = useToast();

  const handleError = useCallback((message: string) => {
    addToast(message, 'error');
    console.error(message);
  }, [addToast]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      if (!session?.access_token) {
        throw new Error("No valid session");
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setIssues(data.issues || []);
    } catch (err: any) {
      console.error("Fetch issues error:", err);
      handleError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotspots = async () => {
    try {
      setHotspotsLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/hotspots`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setHotspots(data.hotspots || []);
    } catch (err: any) {
      console.error("Fetch hotspots error:", err);
      handleError(err.message || "Failed to load hotspots");
    } finally {
      setHotspotsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users`,
        { headers },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTechnicians(
        data.users?.filter(
          (user: User) => user.role === "technician",
        ) || [],
      );
    } catch (err: any) {
      console.error("Fetch users error:", err);
      handleError(err.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOrganization = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch organization");

      const data = await response.json();
      setOrganization(data.organization);
      if (data.organization) {
        setOrgCategories(data.organization.categories || []);
        setOrgLocationLabel(data.organization.locationLabel || "");
      }
    } catch (err: any) {
      console.error("Fetch organization error:", err);
      setOrganization(null);
    }
  };

  const fetchBilling = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me/billing`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!response.ok) return;
      const data = await response.json();
      setBilling(data.billing);
    } catch (err) {
      console.error("Fetch billing error:", err);
    }
  };

  const startCheckout = async (planId: "pro" | "enterprise") => {
    try {
      setCheckoutLoading(planId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me/billing/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ planId }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.billingCheckoutError);

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("Start checkout error:", err);
      handleError(err.message || t.billingCheckoutError);
      setCheckoutLoading("");
    }
  };

  const openPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me/billing/portal`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.billingPortalError);

      window.location.href = data.portalUrl;
    } catch (err: any) {
      console.error("Open billing portal error:", err);
      handleError(err.message || t.billingPortalError);
      setPortalLoading(false);
    }
  };

  const addOrgCategory = () => {
    const value = newCategoryInput.trim();
    if (!value || orgCategories.includes(value)) return;
    setOrgCategories([...orgCategories, value]);
    setNewCategoryInput("");
  };

  const removeOrgCategory = (index: number) => {
    setOrgCategories(orgCategories.filter((_, i) => i !== index));
  };

  const saveOrganization = async () => {
    if (orgCategories.length === 0) {
      handleError(t.atLeastOneCategory);
      return;
    }

    try {
      setSavingOrg(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            categories: orgCategories,
            locationLabel: orgLocationLabel,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.orgUpdateError);

      setOrganization(data.organization);
      setOrgCategories(data.organization.categories || []);
      setOrgLocationLabel(data.organization.locationLabel || "");
      addToast(t.orgUpdateSuccess, "success");
    } catch (err: any) {
      console.error("Save organization error:", err);
      handleError(err.message || t.orgUpdateError);
    } finally {
      setSavingOrg(false);
    }
  };

  const regenerateOrgJoinCode = async () => {
    try {
      setRegeneratingCode(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me/regenerate-code`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.orgRegenerateError);

      setOrganization((prev) => (prev ? { ...prev, joinCode: data.joinCode } : prev));
    } catch (err: any) {
      console.error("Regenerate join code error:", err);
      handleError(err.message || t.orgRegenerateError);
    } finally {
      setRegeneratingCode(false);
    }
  };

  const marketplaceStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return t.marketplaceStatusOpen;
      case "claimed":
        return t.marketplaceStatusClaimed;
      case "completed":
        return t.marketplaceStatusCompleted;
      case "paid":
        return t.marketplaceStatusPaid;
      default:
        return status;
    }
  };

  const fetchContractors = async () => {
    try {
      setContractorsLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/contractors`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setContractors(data.applications || []);
    } catch (err: any) {
      console.error("Fetch contractors error:", err);
      handleError(err.message || "Failed to load contractor applications");
    } finally {
      setContractorsLoading(false);
    }
  };

  const updateContractorStatus = async (userId: string, status: "approved" | "rejected") => {
    try {
      setContractorActionLoading(userId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/contractors/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.contractorStatusError);

      setContractors((prev) =>
        prev.map((contractor) =>
          contractor.id === userId ? { ...contractor, marketplaceStatus: status } : contractor
        )
      );
      addToast(status === "approved" ? t.contractorApprovedSuccess : t.contractorRejectedSuccess, 'success');
    } catch (err: any) {
      console.error("Update contractor status error:", err);
      handleError(err.message || t.contractorStatusError);
    } finally {
      setContractorActionLoading("");
    }
  };

  const postIssueToMarketplace = async () => {
    if (!selectedIssue) return;

    const budget = Number(marketplaceBudget);
    if (!budget || budget <= 0) {
      handleError(t.invalidBudget);
      return;
    }

    try {
      setMarketplaceLoading(selectedIssue.id);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${selectedIssue.id}/marketplace`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ budget }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.postError);

      setIssues((prev) => prev.map((issue) => (issue.id === data.issue.id ? data.issue : issue)));
      setMarketplaceDialogOpen(false);
      setSelectedIssue(null);
      setMarketplaceBudget("");
      addToast(t.postSuccess, 'success');
    } catch (err: any) {
      console.error("Post to marketplace error:", err);
      handleError(err.message || t.postError);
    } finally {
      setMarketplaceLoading("");
    }
  };

  const unpostIssueFromMarketplace = async (issueId: string) => {
    try {
      setMarketplaceLoading(issueId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issueId}/marketplace`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.unpostError);

      setIssues((prev) => prev.map((issue) => (issue.id === data.issue.id ? data.issue : issue)));
      addToast(t.unpostSuccess, 'success');
    } catch (err: any) {
      console.error("Unpost from marketplace error:", err);
      handleError(err.message || t.unpostError);
    } finally {
      setMarketplaceLoading("");
    }
  };

  const payContractorForJob = async (issueId: string) => {
    try {
      setMarketplaceLoading(issueId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/jobs/${issueId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.payError);

      window.open(data.checkoutUrl, '_blank');
    } catch (err: any) {
      console.error("Pay contractor error:", err);
      handleError(err.message || t.payError);
    } finally {
      setMarketplaceLoading("");
    }
  };

  const syncPaymentStatusForJob = async (issueId: string) => {
    try {
      setMarketplaceLoading(issueId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/jobs/${issueId}/sync-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.syncPaymentError);

      if (data.status === "paid") {
        await fetchIssues();
      }
    } catch (err: any) {
      console.error("Sync payment status error:", err);
      handleError(err.message || t.syncPaymentError);
    } finally {
      setMarketplaceLoading("");
    }
  };

  const fetchSuggestions = async (issueId: string) => {
    try {
      setSuggestionsLoading(true);
      setSuggestions([]);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issueId}/suggest-technicians`,
        { headers },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const fetchedSuggestions: TechnicianSuggestion[] = data.suggestions || [];
      setSuggestions(fetchedSuggestions);
      if (fetchedSuggestions.length > 0) {
        setSelectedTechnician(fetchedSuggestions[0].technicianId);
      }
    } catch (err: any) {
      console.error("Fetch suggestions error:", err);
      handleError(err.message || "Failed to load suggested technicians");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const updateIssueStatus = async () => {
    if (!selectedIssue || !newStatus) return;

    try {
      setUpdateLoading(selectedIssue.id);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${selectedIssue.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            adminNote: adminNote.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update issue");
      }

      await fetchIssues();
      setDialogOpen(false);
      setSelectedIssue(null);
      setNewStatus("");
      setAdminNote("");
      addToast("Issue updated successfully", 'success');
    } catch (err: any) {
      console.error("Update issue error:", err);
      handleError(err.message || "Failed to update issue");
    } finally {
      setUpdateLoading("");
    }
  };

  const assignTechnician = async () => {
    if (!selectedIssue || !selectedTechnician) return;

    try {
      setUpdateLoading(selectedIssue.id);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${selectedIssue.id}/assign`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            technicianId: selectedTechnician,
            notes: "",
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Failed to assign technician",
        );
      }

      await fetchIssues();
      setAssignDialogOpen(false);
      setSelectedIssue(null);
      setSelectedTechnician("");
      addToast("Issue assigned successfully", 'success');
    } catch (err: any) {
      console.error("Assign technician error:", err);
      handleError(err.message || "Failed to assign technician");
    } finally {
      setUpdateLoading("");
    }
  };

  const saveUser = async () => {
    try {
      setUpdateLoading("user");

      const url = selectedUser
        ? `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users/${selectedUser.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/signup`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const body = selectedUser
        ? { name: userForm.name, email: userForm.email, role: userForm.role, categories: userForm.categories }
        : { name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role, categories: userForm.categories };

      const response = await fetch(url, {
        method: selectedUser ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(
          body
        ),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save user");
      }

      await fetchUsers();
      setUserDialogOpen(false);
      setSelectedUser(null);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "citizen",
        status: "active",
        categories: [],
      });
      addToast(`User ${selectedUser ? "updated" : "created"} successfully`, 'success');

    } catch (err: any) {
      console.error("Save user error:", err);
      handleError(err.message || "Failed to save user");
    } finally {
      setUpdateLoading("");
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdateLoading("delete");

      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      await fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      addToast("User deleted successfully", 'success');
    } catch (err: any) {
      console.error("Delete user error:", err);
      handleError(err.message || "Failed to delete user");
    } finally {
      setUpdateLoading("");
    }
  };

  const sendNotification = async () => {
    try {
      setUpdateLoading("notification");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            recipientId: notificationForm.recipientType,
            title: notificationForm.title,
            message: notificationForm.message,
            type: "info",
            priority: notificationForm.priority,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Failed to send notification",
        );
      }

      setNotificationDialogOpen(false);
      setNotificationForm({
        title: "",
        message: "",
        recipientType: "all",
        specificUserId: "",
        priority: "medium",
      });
      addToast(t.notificationSent, 'success');
      await fetchSentNotifications();
    } catch (err: any) {
      console.error("Send notification error:", err);
      handleError(err.message || "Failed to send notification");
    } finally {
      setUpdateLoading("");
    }
  };

  const fetchSentNotifications = useCallback(async () => {
    try {
      setSentNotificationsLoading(true);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (tempRole) headers["X-Temp-Role"] = tempRole;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/notifications/sent`,
        { headers },
      );

      if (!response.ok) throw new Error("Failed to load notification history");

      const data = await response.json();
      setSentNotifications(data.broadcasts || []);
    } catch (err: any) {
      console.error("Fetch sent notifications error:", err);
    } finally {
      setSentNotificationsLoading(false);
    }
  }, [session, tempRole]);

  useEffect(() => {
    if (notificationDialogOpen) {
      fetchSentNotifications();
    }
  }, [notificationDialogOpen, fetchSentNotifications]);

  useEffect(() => {
    if (session?.access_token) {
      fetchIssues();
      fetchUsers();
      fetchHotspots();
      fetchOrganization();
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token && organization === null) {
      fetchContractors();
    }
  }, [session, organization]);

  useEffect(() => {
    if (session?.access_token && organization) {
      fetchBilling();
    }
  }, [session, organization]);

  // Picks up the redirect back from Stripe Checkout after a marketplace
  // payment. We can't rely solely on the webhook having already landed by
  // the time the browser redirects, so "success" triggers a sync-payment
  // call as a belt-and-suspenders reconciliation.
  useEffect(() => {
    if (!session?.access_token) return;

    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get("marketplacePayment");
    const issueId = params.get("issueId");
    const billingResult = params.get("billing");
    if (!paymentResult && !billingResult) return;

    if (paymentResult === "success") {
      addToast(t.paymentSuccessToast, "success");
      if (issueId) syncPaymentStatusForJob(issueId);
    } else if (paymentResult === "cancelled") {
      addToast(t.paymentCancelledToast, "info");
    }

    if (billingResult === "success") {
      addToast(t.billingUpgradeSuccessToast, "success");
      fetchBilling();
    } else if (billingResult === "cancelled") {
      addToast(t.billingUpgradeCancelledToast, "info");
    }
    setCheckoutLoading("");

    params.delete("marketplacePayment");
    params.delete("issueId");
    params.delete("billing");
    const newSearch = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue={defaultView} className="space-y-6">
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="issues" className="gap-1.5 whitespace-nowrap">
            <Settings className="h-4 w-4" />
            <span>{t.issueManagement}</span>
          </TabsTrigger>
          <TabsTrigger value="hotspots" className="gap-1.5 whitespace-nowrap">
            <Flame className="h-4 w-4" />
            <span>{t.hotspots}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 whitespace-nowrap">
            <Users className="h-4 w-4" />
            <span>{t.userManagement}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 whitespace-nowrap">
            <Bell className="h-4 w-4" />
            <span>{t.notifications}</span>
          </TabsTrigger>
          {organization && (
            <TabsTrigger value="organization" className="gap-1.5 whitespace-nowrap">
              <Building2 className="h-4 w-4" />
              <span>{t.organization}</span>
            </TabsTrigger>
          )}
          {organization === null && (
            <TabsTrigger value="vetting" className="gap-1.5 whitespace-nowrap">
              <Shield className="h-4 w-4" />
              <span>{t.contractorVetting}</span>
            </TabsTrigger>
          )}
        </TabsList>

              {/* Issues Management Tab */}
              <TabsContent value="issues" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      <span>{t.issueManagement}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={issueSort} onValueChange={(value) => setIssueSort(value as "recent" | "upvotes" | "flagged" | "credibility")}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder={t.sortBy} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">{t.sortRecent}</SelectItem>
                        <SelectItem value="upvotes">{t.sortUpvotes}</SelectItem>
                        <SelectItem value="flagged">{t.sortFlagged}</SelectItem>
                        <SelectItem value="credibility">{t.sortCredibility}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={fetchIssues}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t.refreshIssues}
                    </Button>
                  </div>
                </div>

                {issues.length === 0 ? (
                  <Card>
                    <CardContent>
                      <EmptyState icon={Settings} title={t.noIssuesTitle} description={t.noIssuesDesc} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {[...issues]
                      .sort((a, b) => {
                        if (issueSort === "upvotes") return (b.upvotes ?? 0) - (a.upvotes ?? 0);
                        if (issueSort === "flagged") return (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0);
                        if (issueSort === "credibility") return (a.credibilityScore ?? 100) - (b.credibilityScore ?? 100);
                        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
                      })
                      .map((issue) => (
                      <Card key={issue.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {issue.title}
                                </CardTitle>
                                <StatusBadge kind="priority" value={issue.priority} label={issue.priority} />
                                {(issue.upvotes ?? 0) > 0 && (
                                  <Badge variant="info">
                                    <ThumbsUp className="h-3 w-3" />
                                    {issue.upvotes}
                                  </Badge>
                                )}
                                {issue.flagged && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3" />
                                    {t.needsAttention}
                                  </Badge>
                                )}
                                {issue.credibilityLevel && issue.credibilityLevel !== "high" && (
                                  <CredibilityBadge
                                    level={issue.credibilityLevel}
                                    score={issue.credibilityScore}
                                    signals={issue.credibilitySignals}
                                  />
                                )}
                                {issue.reportedVia === "sms" && (
                                  <Badge variant="outline" title={issue.reporterPhone}>
                                    <MessageSquare className="h-3 w-3" />
                                    {t.viaSms}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{issue.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{issue.reporterName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {new Date(
                                        issue.reportedAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm">
                                  {t.category}: {issue.category}
                                </div>
                                {issue.assignedTechnicianName && (
                                  <div className="text-sm text-info">
                                    {t.assignedTo}:{" "}
                                    {issue.assignedTechnicianName}
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                              <StatusBadge kind="status" value={issue.status} label={issue.status.replace("-", " ")} />
                              <Dialog open={dialogOpen && selectedIssue?.id === issue.id} onOpenChange={(open) => {
                                if (!open) {
                                  setDialogOpen(false);
                                  setSelectedIssue(null);
                                  setNewStatus("");
                                  setAdminNote("");
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setNewStatus(issue.status);
                                      setAdminNote(issue.adminNote || "");
                                      setDialogOpen(true);
                                    }}
                                    disabled={updateLoading === issue.id}
                                  >
                                    <Edit className="h-4 w-4" />
                                    {t.update}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {t.updateIssueStatus}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {t.updateDesc}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="status">
                                          {t.status}
                                        </Label>
                                        <Select
                                          value={newStatus}
                                          onValueChange={setNewStatus}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={t.selectStatus} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {statusOptions.map((status) => (
                                              <SelectItem
                                                key={status.value}
                                                value={status.value}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <status.icon className="h-4 w-4" />
                                                  <span>{status.label}</span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="adminNote">
                                          {t.adminNote}
                                        </Label>
                                        <Textarea
                                          id="adminNote"
                                          placeholder={t.adminNotePlaceholder}
                                          value={adminNote}
                                          onChange={(e) => setAdminNote(e.target.value)}
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                      >
                                        {t.cancel}
                                      </Button>
                                      <Button
                                        onClick={updateIssueStatus}
                                        disabled={
                                          updateLoading === selectedIssue?.id ||
                                          !newStatus
                                        }
                                      >
                                        {updateLoading === selectedIssue?.id ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t.updating}
                                          </>
                                        ) : (
                                          t.updateIssue
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {!issue.assignedTechnician &&
                                technicians.length > 0 && (
                                  <Dialog open={assignDialogOpen && selectedIssue?.id === issue.id} onOpenChange={(open) => {
                                    if (!open) {
                                      setAssignDialogOpen(false);
                                      setSelectedIssue(null);
                                      setSelectedTechnician("");
                                      setSuggestions([]);
                                    }
                                  }}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedIssue(issue);
                                          setSelectedTechnician("");
                                          setAssignDialogOpen(true);
                                          fetchSuggestions(issue.id);
                                        }}
                                        disabled={updateLoading === issue.id}
                                      >
                                        <Wrench className="h-4 w-4" />
                                        {t.assignTechnician}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          {t.assignTechnician}
                                        </DialogTitle>
                                        <DialogDescription>
                                          {t.assignDesc}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label>
                                            {t.suggestedTechnicians}
                                          </Label>
                                          <p className="text-xs text-muted-foreground">
                                            {t.suggestedTechniciansDesc}
                                          </p>
                                          {suggestionsLoading ? (
                                            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                                              <Loader2 className="h-5 w-5 animate-spin" />
                                              {t.loadingSuggestions}
                                            </div>
                                          ) : suggestions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                              {t.noSuggestions}
                                            </p>
                                          ) : (
                                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                              {suggestions.map((tech) => {
                                                const availabilityInfo = getAvailabilityInfo(tech.availability);
                                                const AvailabilityIcon = availabilityInfo.icon;
                                                const availabilityLabel = tech.availability === "off_duty" ? "offDuty" : tech.availability;
                                                return (
                                                  <button
                                                    type="button"
                                                    key={tech.technicianId}
                                                    onClick={() => setSelectedTechnician(tech.technicianId)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                                                      selectedTechnician === tech.technicianId
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:bg-muted"
                                                    }`}
                                                  >
                                                    <div className="flex items-center justify-between mb-1.5 gap-2">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground">{tech.name}</span>
                                                        {tech.skillMatch && (
                                                          <Badge variant="outline" className="text-xs">
                                                            <Sparkles className="h-3 w-3" />
                                                            {t.skillMatch}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                      <Badge variant={getScoreVariant(tech.score)}>
                                                        {tech.score}% {t.matchScore}
                                                      </Badge>
                                                    </div>
                                                    <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
                                                      <span className={`flex items-center gap-1 ${availabilityInfo.color}`}>
                                                        <AvailabilityIcon className="h-3.5 w-3.5" />
                                                        <span>{t[availabilityLabel as keyof typeof t]}</span>
                                                      </span>
                                                      <span className="flex items-center gap-1">
                                                        <Navigation className="h-3.5 w-3.5" />
                                                        <span>
                                                          {tech.distanceKm !== null
                                                            ? `${tech.distanceKm} km ${t.away}`
                                                            : t.distanceUnknown}
                                                        </span>
                                                      </span>
                                                      <span className="flex items-center gap-1">
                                                        <Wrench className="h-3.5 w-3.5" />
                                                        <span>{tech.activeAssignments} {t.activeTasks}</span>
                                                      </span>
                                                    </div>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setAssignDialogOpen(false)}
                                        >
                                          {t.cancel}
                                        </Button>
                                        <Button
                                          onClick={assignTechnician}
                                          disabled={
                                            updateLoading === selectedIssue?.id ||
                                            !selectedTechnician
                                          }
                                        >
                                          {updateLoading === selectedIssue?.id
                                            ? t.assigning
                                            : t.assignIssue}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              <Comments entityType="issue" entityId={issue.id} session={session} language={language} tempRole={tempRole} />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-foreground">
                              {issue.description}
                            </p>

                            {issue.photoUrl && (
                              <img
                                src={issue.photoUrl}
                                alt="Issue photo"
                                className="w-full max-w-sm h-32 object-cover rounded-xl border border-border"
                              />
                            )}

                            {issue.adminNote && (
                              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                                <h4 className="font-medium text-foreground text-sm mb-1">
                                  {t.currentAdminNote}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  {issue.adminNote}
                                </p>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              {t.lastUpdated}:{" "}
                              {new Date(
                                issue.updatedAt,
                              ).toLocaleString()}
                            </div>

                            {!issue.assignedTechnician &&
                              !issue.marketplace &&
                              issue.status !== "resolved" &&
                              issue.status !== "rejected" && (
                                <Dialog
                                  open={marketplaceDialogOpen && selectedIssue?.id === issue.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setMarketplaceDialogOpen(false);
                                      setSelectedIssue(null);
                                      setMarketplaceBudget("");
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setMarketplaceBudget("");
                                        setMarketplaceDialogOpen(true);
                                      }}
                                    >
                                      <Store className="h-4 w-4" />
                                      {t.postToMarketplace}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        {t.postToMarketplace}
                                      </DialogTitle>
                                      <DialogDescription>
                                        {t.postToMarketplaceDesc}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                      <Label htmlFor="marketplaceBudget">
                                        {t.marketplaceBudgetLabel}
                                      </Label>
                                      <Input
                                        id="marketplaceBudget"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        placeholder={t.marketplaceBudgetPlaceholder}
                                        value={marketplaceBudget}
                                        onChange={(e) => setMarketplaceBudget(e.target.value)}
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setMarketplaceDialogOpen(false)}
                                      >
                                        {t.cancel}
                                      </Button>
                                      <Button
                                        onClick={postIssueToMarketplace}
                                        disabled={marketplaceLoading === issue.id || !marketplaceBudget}
                                      >
                                        {marketplaceLoading === issue.id ? t.posting : t.post}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                            {issue.marketplace && (
                              <div className="flex items-center flex-wrap gap-2">
                                <StatusBadge
                                  kind="marketplace"
                                  value={issue.marketplace.status}
                                  label={`${t.marketplaceLabel}: ${marketplaceStatusLabel(issue.marketplace.status)}`}
                                />
                                <span className="text-sm text-muted-foreground flex items-center gap-0.5">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {issue.marketplace.budget.toFixed(2)}
                                </span>
                                {issue.marketplace.contractorName && (
                                  <span className="text-sm text-muted-foreground">
                                    {t.assignedTo}: {issue.marketplace.contractorName}
                                  </span>
                                )}
                                {issue.marketplace.status === "open" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => unpostIssueFromMarketplace(issue.id)}
                                    disabled={marketplaceLoading === issue.id}
                                  >
                                    {t.cancelPosting}
                                  </Button>
                                )}
                                {issue.marketplace.status === "completed" && (
                                  <Button
                                    size="sm"
                                    onClick={() => payContractorForJob(issue.id)}
                                    disabled={marketplaceLoading === issue.id}
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    {marketplaceLoading === issue.id ? t.paying : t.payContractor}
                                  </Button>
                                )}
                                {issue.marketplace.status === "completed" && issue.marketplace.transactionId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => syncPaymentStatusForJob(issue.id)}
                                    disabled={marketplaceLoading === issue.id}
                                  >
                                    <RefreshCw className={`h-4 w-4 ${marketplaceLoading === issue.id ? "animate-spin" : ""}`} />
                                    {marketplaceLoading === issue.id ? t.syncingPayment : t.syncPayment}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Hotspots Tab */}
              <TabsContent value="hotspots" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Flame className="h-5 w-5 text-primary" />
                      <span>{t.hotspots}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.hotspotsSubtitle}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchHotspots}
                    disabled={hotspotsLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t.refreshHotspots}
                  </Button>
                </div>

                {hotspots.length === 0 ? (
                  <Card>
                    <CardContent>
                      <EmptyState icon={Flame} title={t.noHotspotsTitle} description={t.noHotspotsDesc} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {hotspots.map((hotspot) => (
                      <Card key={hotspot.location}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{hotspot.location}</span>
                              </CardTitle>
                              <CardDescription>
                                {t.topCategory}: {hotspot.topCategory}
                              </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                              <Badge variant="warning">
                                <Flame className="h-3 w-3" />
                                {hotspot.totalIssues} {t.totalIssuesLabel}
                              </Badge>
                              {hotspot.flaggedIssues > 0 && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  {hotspot.flaggedIssues}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              {t.recentIssuesLabel}: {hotspot.recentIssues}
                            </div>
                            {hotspot.avgResolutionDays !== null && (
                              <div className="text-sm text-muted-foreground">
                                {t.avgResolution}: {hotspot.avgResolutionDays} {t.days}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(hotspot.categories).map(([category, count]) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Users Management Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>{t.userManagement}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.usersSubtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={fetchUsers}
                      disabled={usersLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t.refreshUsers}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setUserForm({
                          name: "",
                          email: "",
                          password: "",
                          role: "citizen",
                          status: "active",
                          categories: [],
                        });
                        setUserDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.addUser}
                    </Button>
                  </div>
                </div>

                {users.length === 0 ? (
                  <Card>
                    <CardContent>
                      <EmptyState icon={Users} title={t.noUsersTitle} description={t.noUsersDesc} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center text-white shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {user.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Badge variant={getRoleVariant(user.role)}>
                                    {user.role === "admin" && user.organizationId
                                      ? t.orgAdminRole
                                      : user.role === "technician" && user.marketplaceStatus === "approved"
                                        ? t.contractorRole
                                        : t[user.role as keyof typeof t] || user.role}
                                  </Badge>
                                  <Badge
                                    variant={
                                      user.status === "active"
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {t[
                                      user.status as keyof typeof t
                                    ] || user.status}
                                  </Badge>
                                </div>
                                {user.role === 'technician' && user.categories.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">{t.categories}:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.categories.map(category => (
                                        <Badge key={category} variant="outline" className="text-xs">
                                          {category}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {t.joinedOn}:{" "}
                                  {new Date(
                                    user.createdAt,
                                  ).toLocaleDateString()}
                                  {user.lastSeenAt && (
                                    <span className="ml-2">
                                      {t.lastSeen}:{" "}
                                      {new Date(
                                        user.lastSeenAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserForm({
                                    name: user.name,
                                    email: user.email,
                                    password: "", // Clear password for edit
                                    role: user.role,
                                    status: user.status,
                                    categories: user.categories,
                                  });
                                  setUserDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                {t.editUser}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                {t.deleteUser}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent
                value="notifications"
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <span>{t.notifications}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.notificationsSubtitle}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setNotificationForm({
                        title: "",
                        message: "",
                        recipientType: "all",
                        specificUserId: "",
                        priority: "medium",
                      });
                      setNotificationDialogOpen(true);
                    }}
                  >
                    <Send className="h-4 w-4" />
                    {t.sendNotification}
                  </Button>
                </div>

                <Card>
                  <CardContent>
                    <EmptyState
                      icon={Bell}
                      title={t.sendNotification}
                      description="Send notifications to users and technicians about updates, announcements, or important information."
                      action={{
                        label: t.sendNotification,
                        onClick: () => {
                          setNotificationForm({
                            title: "",
                            message: "",
                            recipientType: "all",
                            specificUserId: "",
                            priority: "medium",
                          });
                          setNotificationDialogOpen(true);
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {organization && (
                <TabsContent value="organization" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>{t.organization}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.organizationSubtitle}
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t.orgCategories}</CardTitle>
                      <CardDescription>{t.orgCategoriesDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {orgCategories.map((cat, index) => (
                          <Badge
                            key={`${cat}-${index}`}
                            variant="secondary"
                            className="pr-1"
                          >
                            <span>{cat}</span>
                            <button
                              type="button"
                              onClick={() => removeOrgCategory(index)}
                              aria-label={t.removeCategoryAria}
                              className="rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Input
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addOrgCategory();
                            }
                          }}
                          placeholder={t.newCategoryPlaceholder}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addOrgCategory}
                          disabled={!newCategoryInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                          {t.addCategory}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t.orgLocationLabel}</CardTitle>
                      <CardDescription>{t.orgLocationLabelDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        value={orgLocationLabel}
                        onChange={(e) => setOrgLocationLabel(e.target.value)}
                        placeholder={t.orgLocationLabelPlaceholder}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={saveOrganization}
                      disabled={savingOrg}
                    >
                      {savingOrg ? t.saving : t.saveOrganization}
                    </Button>
                  </div>

                  {organization.joinCode && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t.joinCode}</CardTitle>
                        <CardDescription>{t.joinCodeHint}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="px-3 py-1.5 bg-muted rounded-xl text-sm font-mono">
                            {organization.joinCode}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={regenerateOrgJoinCode}
                            disabled={regeneratingCode}
                          >
                            <RefreshCw className={`h-4 w-4 ${regeneratingCode ? "animate-spin" : ""}`} />
                            {t.regenerateCode}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span>{t.billingTitle}</span>
                      </CardTitle>
                      <CardDescription>{t.billingDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {billing && (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {billing.planId === "free" ? t.planFree : billing.planId === "pro" ? t.planPro : t.planEnterprise}
                            </Badge>
                            <Badge
                              variant={
                                billing.subscriptionStatus === "active"
                                  ? "success"
                                  : billing.subscriptionStatus === "past_due"
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {billing.subscriptionStatus === "active"
                                ? t.subscriptionStatusActive
                                : billing.subscriptionStatus === "past_due"
                                ? t.subscriptionStatusPastDue
                                : t.subscriptionStatusCanceled}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {billing.seatLimit === null
                                ? t.seatsUsedUnlimited.replace("{used}", String(billing.seatsUsed))
                                : t.seatsUsedLabel
                                    .replace("{used}", String(billing.seatsUsed))
                                    .replace("{limit}", String(billing.seatLimit))}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {billing.planId === "free" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => startCheckout("pro")}
                                  disabled={checkoutLoading !== ""}
                                >
                                  {checkoutLoading === "pro" ? t.upgrading : t.upgradeToPro}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startCheckout("enterprise")}
                                  disabled={checkoutLoading !== ""}
                                >
                                  {checkoutLoading === "enterprise" ? t.upgrading : t.upgradeToEnterprise}
                                </Button>
                              </>
                            )}
                            {billing.hasBillingAccount && (
                              <Button size="sm" variant="outline" onClick={openPortal} disabled={portalLoading}>
                                {portalLoading ? t.openingPortal : t.manageBilling}
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {organization === null && (
                <TabsContent value="vetting" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>{t.contractorVetting}</span>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t.contractorVettingSubtitle}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={fetchContractors}
                      disabled={contractorsLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t.refreshUsers}
                    </Button>
                  </div>

                  {contractors.length === 0 ? (
                    <Card>
                      <CardContent>
                        <EmptyState icon={Shield} title={t.noContractorApplications} description={t.noContractorApplicationsDesc} />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {contractors.map((contractor) => (
                        <Card key={contractor.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <h3 className="font-medium text-foreground">{contractor.name}</h3>
                                <p className="text-sm text-muted-foreground">{contractor.email}</p>
                                <div className="flex items-center flex-wrap gap-1 mt-2">
                                  <Badge
                                    variant={
                                      contractor.marketplaceStatus === "approved"
                                        ? "success"
                                        : contractor.marketplaceStatus === "rejected"
                                        ? "destructive"
                                        : "warning"
                                    }
                                  >
                                    {contractor.marketplaceStatus === "approved"
                                      ? t.applicationApproved
                                      : contractor.marketplaceStatus === "rejected"
                                      ? t.applicationRejected
                                      : t.applicationPending}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    {contractor.stripeOnboardingComplete ? t.stripeConnected : t.stripeNotConnected}
                                  </Badge>
                                  {contractor.categories.map((category) => (
                                    <Badge key={category} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {contractor.marketplaceStatus === "pending" && (
                                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => updateContractorStatus(contractor.id, "approved")}
                                    disabled={contractorActionLoading === contractor.id}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    {t.approve}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateContractorStatus(contractor.id, "rejected")}
                                    disabled={contractorActionLoading === contractor.id}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    {t.reject}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>

            {/* User Dialog */}
            <Dialog
              open={userDialogOpen}
              onOpenChange={setUserDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedUser ? t.editUserDetails : t.addNewUser}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">
                      {t.userName}
                    </Label>
                    <Input
                      id="userName"
                      placeholder={t.userNamePlaceholder}
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">
                      {t.userEmail}
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder={t.userEmailPlaceholder}
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {!selectedUser && (
                    <div className="space-y-2">
                      <Label htmlFor="userPassword">
                        Password
                      </Label>
                      <Input
                        id="userPassword"
                        type="password"
                        placeholder="Enter password"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="userRole"
                    >
                      {t.userRole}
                    </Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value: any) =>
                        setUserForm((prev) => ({
                          ...prev,
                          role: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">
                          {t.citizen}
                        </SelectItem>
                        <SelectItem value="technician">
                          {t.technician}
                        </SelectItem>
                        <SelectItem value="admin">
                          {t.admin}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userStatus">
                      {t.userStatus}
                    </Label>
                    <Select
                      value={userForm.status}
                      onValueChange={(value: any) =>
                        setUserForm((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {t.active}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t.inactive}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {userForm.role === 'technician' && (
                  <div className="space-y-2">
                    <Label>{t.categories}</Label>
                    <p className="text-sm text-muted-foreground">{t.selectCategories}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {issueCategories.map(category => (
                        <div key={category} className="flex items-center gap-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={userForm.categories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setUserForm(prev => ({ ...prev, categories: [...prev.categories, category] }))
                              } else {
                                setUserForm(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }))
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUserDialogOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={saveUser}
                    disabled={
                      updateLoading === "user" ||
                      !userForm.name ||
                      !userForm.email ||
                      (!selectedUser && !userForm.password)
                    }
                  >
                    {updateLoading === "user" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      t.save
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t.confirmDelete}
                  </DialogTitle>
                  <DialogDescription>
                    {t.deleteUserConfirm}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteUser}
                    disabled={updateLoading === "delete"}
                  >
                    {updateLoading === "delete" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.deleting}
                      </>
                    ) : (
                      t.deleteUser
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Send Notification Dialog */}
            <Dialog
              open={notificationDialogOpen}
              onOpenChange={setNotificationDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t.sendNotification}
                  </DialogTitle>
                </DialogHeader>

                <Tabs value={notificationTab} onValueChange={(v) => setNotificationTab(v as "compose" | "history")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="compose">{t.composeTab}</TabsTrigger>
                    <TabsTrigger value="history">{t.historyTab}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="compose" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="notificationTitle">
                      {t.notificationTitle}
                    </Label>
                    <Input
                      id="notificationTitle"
                      placeholder={t.notificationTitlePlaceholder}
                      value={notificationForm.title}
                      onChange={(e) =>
                        setNotificationForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notificationMessage">
                      {t.notificationMessage}
                    </Label>
                    <Textarea
                      id="notificationMessage"
                      placeholder={t.notificationMessagePlaceholder}
                      value={notificationForm.message}
                      onChange={(e) =>
                        setNotificationForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientType">
                      {t.recipientType}
                    </Label>
                    <Select
                      value={notificationForm.recipientType}
                      onValueChange={(value) =>
                        setNotificationForm((prev) => ({
                          ...prev,
                          recipientType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t.allUsers}
                        </SelectItem>
                        <SelectItem value="technicians">
                          {t.allTechnicians}
                        </SelectItem>
                        <SelectItem value="citizens">
                          {t.allCitizens}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      {t.priority}
                    </Label>
                    <Select
                      value={notificationForm.priority}
                      onValueChange={(value: any) =>
                        setNotificationForm((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t.low}</SelectItem>
                        <SelectItem value="medium">
                          {t.medium}
                        </SelectItem>
                        <SelectItem value="high">{t.high}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </TabsContent>

                  <TabsContent value="history" className="pt-2">
                    {sentNotificationsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : sentNotifications.length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        title={t.noSentHistory}
                        description={t.noSentHistoryDesc}
                      />
                    ) : (
                      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                        {sentNotifications.map((sent) => (
                          <div key={sent.id} className="rounded-xl border border-border p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-sm">{sent.title}</span>
                              <StatusBadge kind="priority" value={sent.priority} />
                            </div>
                            <p className="text-sm text-muted-foreground">{sent.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                              <Badge variant="outline" className="text-xs">
                                {t.sentTo}: {sent.target === 'all' ? t.allUsers : sent.target === 'technicians' ? t.allTechnicians : sent.target === 'citizens' ? t.allCitizens : sent.target}
                              </Badge>
                              <span>{sent.recipientCount} {t.recipientsCount}</span>
                              <span>·</span>
                              <span>{new Date(sent.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNotificationDialogOpen(false)}
                  >
                    {t.cancel}
                  </Button>
                  {notificationTab === "compose" && (
                    <Button
                      onClick={sendNotification}
                      disabled={
                        updateLoading === "notification" ||
                        !notificationForm.title ||
                        !notificationForm.message
                      }
                    >
                      {updateLoading === "notification" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t.sending}
                        </>
                      ) : (
                        t.sendToAll
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  );
}

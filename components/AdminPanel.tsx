
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Label } from "./ui/label.tsx";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import { Skeleton } from "./ui/skeleton.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.tsx";
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
} from "lucide-react";
import { projectId } from "../utils/supabase/info.ts";
// import './index.css';

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
    notificationSent: "Notification envoyée avec succès",
  },
};

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
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "technician" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  lastSeenAt?: string;
}

const statusOptions = [
  {
    value: "reported",
    label: "Reported",
    icon: AlertCircle,
    color:
      "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200",
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Clock,
    color:
      "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    color:
      "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: XCircle,
    color:
      "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200",
  },
];

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find(
    (opt) => opt.value === status,
  );
  return (
    statusOption?.color ||
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200";
    case "low":
      return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200";
    case "technician":
      return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200";
    case "citizen":
      return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
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
  const [users, setUsers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] =
    useState(false);

  // User form
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "citizen" as "citizen" | "technician" | "admin",
    status: "active" as "active" | "inactive",
  });

  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    recipientType: "all",
    specificUserId: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const t = translations[language];

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

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
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setError("");

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
      setError(err.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
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
      setSuccess("Issue updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Update issue error:", err);
      setError(err.message || "Failed to update issue");
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
      setSuccess("Issue assigned successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Assign technician error:", err);
      setError(err.message || "Failed to assign technician");
    } finally {
      setUpdateLoading("");
    }
  };

  const saveUser = async () => {
    try {
      setUpdateLoading("user");

      const url = selectedUser
        ? `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users/${selectedUser.id}/role`
        : `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      if (tempRole) {
        headers["X-Temp-Role"] = tempRole;
      }

      const response = await fetch(url, {
        method: selectedUser ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(
          selectedUser ? { role: userForm.role } : userForm,
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
        role: "citizen",
        status: "active",
      });
      setSuccess(
        `User ${selectedUser ? "updated" : "created"} successfully`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Save user error:", err);
      setError(err.message || "Failed to save user");
    } finally {
      setUpdateLoading("");
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdateLoading("delete");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      await fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Delete user error:", err);
      setError(err.message || "Failed to delete user");
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
            recipientId:
              notificationForm.specificUserId || "all",
            title: notificationForm.title,
            message: notificationForm.message,
            type: "info",
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
      setSuccess(t.notificationSent);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Send notification error:", err);
      setError(err.message || "Failed to send notification");
    } finally {
      setUpdateLoading("");
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchIssues();
      fetchUsers();
    }
  }, [session]);

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
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
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
        .w-6 { width: 1.5rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-24 { width: 6rem; }
        .w-48 { width: 12rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
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
        .max-w-4xl { max-width: 56rem; }
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
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={defaultView} className="space-y-6">
              <TabsList className="bg-card border-border">
                <TabsTrigger
                  value="issues"
                  className="flex items-center space-x-2 text-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  <span>{t.issueManagement}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex items-center space-x-2 text-foreground hover:bg-muted"
                >
                  <Users className="h-4 w-4" />
                  <span>{t.userManagement}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center space-x-2 text-foreground hover:bg-muted"
                >
                  <Bell className="h-4 w-4" />
                  <span>{t.notifications}</span>
                </TabsTrigger>
              </TabsList>

              {/* Issues Management Tab */}
              <TabsContent value="issues" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>{t.issueManagement}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.subtitle}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchIssues}
                    disabled={loading}
                    className="bg-background border-border text-foreground hover:bg-muted"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t.refreshIssues}
                  </Button>
                </div>

                {issues.length === 0 ? (
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {t.noIssuesTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        {t.noIssuesDesc}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <Card
                        key={issue.id}
                        className="bg-card border-border shadow-lg"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <CardTitle className="text-lg text-foreground">
                                  {issue.title}
                                </CardTitle>
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(
                                    issue.priority,
                                  )}
                                >
                                  {issue.priority}
                                </Badge>
                              </div>
                              <CardDescription className="space-y-1 text-muted-foreground">
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{issue.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{issue.reporterName}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
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
                                  <div className="text-sm text-blue-600 dark:text-blue-400">
                                    {t.assignedTo}:{" "}
                                    {issue.assignedTechnicianName}
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={getStatusColor(
                                  issue.status,
                                )}
                              >
                                {issue.status
                                  .replace("-", " ")
                                  .toUpperCase()}
                              </Badge>
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
                                    className="bg-background border-border text-foreground hover:bg-muted"
                                    disabled={updateLoading === issue.id}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    {t.update}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card border-border">
                                  <DialogHeader>
                                    <DialogTitle className="text-foreground">
                                      {t.updateIssueStatus}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                      {t.updateDesc}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor="status"
                                          className="text-foreground"
                                        >
                                          {t.status}
                                        </Label>
                                        <Select
                                          value={newStatus}
                                          onValueChange={setNewStatus}
                                        >
                                          <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder={t.selectStatus} />
                                          </SelectTrigger>
                                          <SelectContent className="bg-card border-border">
                                            {statusOptions.map((status) => (
                                              <SelectItem
                                                key={status.value}
                                                value={status.value}
                                                className="text-foreground"
                                              >
                                                <div className="flex items-center space-x-2">
                                                  <status.icon className="h-4 w-4" />
                                                  <span>{status.label}</span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor="adminNote"
                                          className="text-foreground"
                                        >
                                          {t.adminNote}
                                        </Label>
                                        <Textarea
                                          id="adminNote"
                                          placeholder={t.adminNotePlaceholder}
                                          value={adminNote}
                                          onChange={(e) => setAdminNote(e.target.value)}
                                          rows={3}
                                          className="bg-background border-border text-foreground"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="bg-background border-border text-foreground hover:bg-muted"
                                      >
                                        {t.cancel}
                                      </Button>
                                      <Button
                                        onClick={updateIssueStatus}
                                        disabled={
                                          updateLoading === selectedIssue?.id ||
                                          !newStatus
                                        }
                                        className="bg-primary text-white hover:bg-primary/90"
                                      >
                                        {updateLoading === selectedIssue?.id ? (
                                          <>
                                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                              <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                                            </svg>
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
                                        }}
                                        className="bg-background border-border text-foreground hover:bg-muted"
                                        disabled={updateLoading === issue.id}
                                      >
                                        <Wrench className="h-4 w-4 mr-1" />
                                        {t.assignTechnician}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-card border-border">
                                      <DialogHeader>
                                        <DialogTitle className="text-foreground">
                                          {t.assignTechnician}
                                        </DialogTitle>
                                        <DialogDescription className="text-muted-foreground">
                                          {t.assignDesc}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label
                                            htmlFor="technician"
                                            className="text-foreground"
                                          >
                                            {t.selectTechnician}
                                          </Label>
                                          <Select
                                            value={selectedTechnician}
                                            onValueChange={setSelectedTechnician}
                                          >
                                            <SelectTrigger className="bg-background border-border text-foreground">
                                              <SelectValue placeholder={t.selectTechnician} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                              {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id} className="text-foreground">
                                                  <div className="flex items-center space-x-2">
                                                    <Wrench className="h-4 w-4" />
                                                    <span>{tech.name}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setAssignDialogOpen(false)}
                                          className="bg-background border-border text-foreground hover:bg-muted"
                                        >
                                          {t.cancel}
                                        </Button>
                                        <Button
                                          onClick={assignTechnician}
                                          disabled={
                                            updateLoading === selectedIssue?.id ||
                                            !selectedTechnician
                                          }
                                          className="bg-primary text-white hover:bg-primary/90"
                                        >
                                          {updateLoading === selectedIssue?.id
                                            ? t.assigning
                                            : t.assignIssue}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
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
                                className="w-full max-w-sm h-32 object-cover rounded-lg border border-border"
                              />
                            )}

                            {issue.adminNote && (
                              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                                  {t.currentAdminNote}
                                </h4>
                                <p className="text-blue-800 dark:text-blue-200 text-sm">
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Users Management Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>{t.userManagement}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t.usersSubtitle}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={fetchUsers}
                      disabled={usersLoading}
                      className="bg-background border-border text-foreground hover:bg-muted"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t.refreshUsers}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setUserForm({
                          name: "",
                          email: "",
                          role: "citizen",
                          status: "active",
                        });
                        setUserDialogOpen(true);
                      }}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t.addUser}
                    </Button>
                  </div>
                </div>

                {users.length === 0 ? (
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {t.noUsersTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        {t.noUsersDesc}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card
                        key={user.id}
                        className="bg-card border-border shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {user.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    className={getRoleColor(
                                      user.role,
                                    )}
                                  >
                                    {t[user.role as keyof typeof t] ||
                                      user.role}
                                  </Badge>
                                  <Badge
                                    variant={
                                      user.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      user.status === "active"
                                        ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                    }
                                  >
                                    {t[
                                      user.status as keyof typeof t
                                    ] || user.status}
                                  </Badge>
                                </div>
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
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserForm({
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                    status: user.status,
                                  });
                                  setUserDialogOpen(true);
                                }}
                                className="bg-background border-border text-foreground hover:bg-muted"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {t.editUser}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-muted"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
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
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t.sendNotification}
                  </Button>
                </div>

                <Card className="bg-card border-border shadow-lg">
                  <CardContent className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t.sendNotification}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Send notifications to users and technicians
                      about updates, announcements, or important
                      information.
                    </p>
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
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t.sendNotification}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* User Dialog */}
            <Dialog
              open={userDialogOpen}
              onOpenChange={setUserDialogOpen}
            >
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {selectedUser ? t.editUserDetails : t.addNewUser}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="userName"
                      className="text-foreground"
                    >
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
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="userEmail"
                      className="text-foreground"
                    >
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
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="userRole"
                      className="text-foreground"
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
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="citizen" className="text-foreground">
                          {t.citizen}
                        </SelectItem>
                        <SelectItem value="technician" className="text-foreground">
                          {t.technician}
                        </SelectItem>
                        <SelectItem value="admin" className="text-foreground">
                          {t.admin}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="userStatus"
                      className="text-foreground"
                    >
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
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="active" className="text-foreground">
                          {t.active}
                        </SelectItem>
                        <SelectItem value="inactive" className="text-foreground">
                          {t.inactive}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUserDialogOpen(false)}
                    className="bg-background border-border text-foreground hover:bg-muted"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={saveUser}
                    disabled={
                      updateLoading === "user" ||
                      !userForm.name ||
                      !userForm.email
                    }
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {updateLoading === "user" ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                        </svg>
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
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {t.confirmDelete}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {t.deleteUserConfirm}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    className="bg-background border-border text-foreground hover:bg-muted"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteUser}
                    disabled={updateLoading === "delete"}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updateLoading === "delete" ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                        </svg>
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
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {t.sendNotification}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="notificationTitle"
                      className="text-foreground"
                    >
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
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="notificationMessage"
                      className="text-foreground"
                    >
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
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="recipientType"
                      className="text-foreground"
                    >
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
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all" className="text-foreground">
                          {t.allUsers}
                        </SelectItem>
                        <SelectItem value="technicians" className="text-foreground">
                          {t.allTechnicians}
                        </SelectItem>
                        <SelectItem value="citizens" className="text-foreground">
                          {t.allCitizens}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="priority"
                      className="text-foreground"
                    >
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
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="low" className="text-foreground">{t.low}</SelectItem>
                        <SelectItem value="medium" className="text-foreground">
                          {t.medium}
                        </SelectItem>
                        <SelectItem value="high" className="text-foreground">{t.high}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNotificationDialogOpen(false)}
                    className="bg-background border-border text-foreground hover:bg-muted"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={sendNotification}
                    disabled={
                      updateLoading === "notification" ||
                      !notificationForm.title ||
                      !notificationForm.message
                    }
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {updateLoading === "notification" ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                        </svg>
                        {t.sending}
                      </>
                    ) : (
                      t.sendToAll
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}

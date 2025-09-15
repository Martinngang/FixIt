import { useState, useEffect } from 'react'
import { Auth } from '../components/Auth.tsx'
import { LandingPage } from '../components/LandingPage.tsx'
import { Dashboard } from '../components/Dashboard.tsx'
import { ReportIssue } from '../components/ReportIssue.tsx'
import { MyIssues } from '../components/MyIssues.tsx'
import { AdminPanel } from '../components/AdminPanel.tsx'
import { TechnicianPanel } from '../components/TechnicianPanel.tsx'
import { NotificationsPanel } from '../components/NotificationsPanel.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx'
import { Button } from '../components/ui/button.tsx'
import { Badge } from '../components/ui/badge.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx'
import { User, MapPin, Settings, LogOut, Bug, Globe, Camera, Moon, Sun, Wrench, Bell, Users, UserCog, Menu, X } from 'lucide-react'
import { supabase } from '../utils/supabase/client.ts'
import './index.css'

const translations = {
  en: {
    appTitle: 'FixIt',
    appSubtitle: 'Civic Issue Reporting',
    dashboard: 'Dashboard',
    reportIssue: 'Report Issue',
    myIssues: 'My Reports',
    myTasks: 'My Tasks',
    technician: 'Field Work',
    admin: 'Admin Panel',
    userManagement: 'Users',
    notifications: 'Notifications',
    signOut: 'Sign Out',
    loading: 'Loading FixIt...',
    toggleTheme: 'Toggle theme',
    client: 'Client',
    citizen: 'Citizen',
    technicianRole: 'Technician',
    adminRole: 'Administrator',
    switchRole: 'Switch Role (Testing)',
    roleUpdated: 'Role updated successfully'
  },
  fr: {
    appTitle: 'FixIt',
    appSubtitle: 'Signalement de problèmes civiques',
    dashboard: 'Tableau de bord',
    reportIssue: 'Signaler un problème',
    myIssues: 'Mes rapports',
    myTasks: 'Mes tâches',
    technician: 'Travail terrain',
    admin: 'Panneau admin',
    userManagement: 'Utilisateurs',
    notifications: 'Notifications',
    signOut: 'Déconnexion',
    loading: 'Chargement de FixIt...',
    toggleTheme: 'Basculer le thème',
    client: 'Client',
    citizen: 'Citoyen',
    technicianRole: 'Technicien',
    adminRole: 'Administrateur',
    switchRole: 'Changer de rôle (Test)',
    roleUpdated: 'Rôle mis à jour avec succès'
  }
}

export default function App() {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'fr'>('en')
  const [showAuth, setShowAuth] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [tempRole, setTempRole] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        setShowAuth(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowAuth(false)
    setTempRole(null)
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    setShowAuth(true)
    setMobileMenuOpen(false)
  }

  const handleRoleChange = async (newRole: string) => {
    setTempRole(newRole)
    
    const message = document.createElement('div')
    message.textContent = translations[language].roleUpdated
    message.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    document.body.appendChild(message)
    setTimeout(() => {
      document.body.removeChild(message)
    }, 2000)
  }

  const t = translations[language]
  const userRole = tempRole || user?.user_metadata?.role || 'citizen'
  const userName = user?.user_metadata?.name || user?.email || 'User'

  const getTabsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: t.dashboard, icon: MapPin },
          { id: 'admin', label: t.admin, icon: Settings },
          { id: 'users', label: t.userManagement, icon: Users },
          { id: 'notifications', label: t.notifications, icon: Bell }
        ]
      case 'technician':
        return [
          { id: 'technician', label: t.technician, icon: Wrench },
          { id: 'my-tasks', label: t.myTasks, icon: User },
          { id: 'notifications', label: t.notifications, icon: Bell }
        ]
      default:
        return [
          { id: 'dashboard', label: t.dashboard, icon: MapPin },
          { id: 'report', label: t.reportIssue, icon: Camera },
          { id: 'my-issues', label: t.myIssues, icon: User },
          { id: 'notifications', label: t.notifications, icon: Bell }
        ]
    }
  }

  const availableTabs = getTabsForRole(userRole)
  const defaultTab = userRole === 'technician' ? 'technician' : 'dashboard'

  if (loading) {
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
            --green-600: #22C55E;
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
            --green-600: #4ADE80;
          }
          html { scroll-behavior: smooth; }
          body {
            background-color: var(--background);
            color: var(--foreground);
            transition: background-color 0.3s ease, color 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
          .bg-background { background-color: var(--background); }
          .text-foreground { color: var(--foreground); }
          .border-primary { border-color: var(--primary); }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .text-center { text-align: center; }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rounded-full { border-radius: 9999px; }
          .h-12 { height: 3rem; }
          .w-12 { width: 3rem; }
          .border-b-2 { border-bottom-width: 2px; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .mb-4 { margin-bottom: 1rem; }
        `}</style>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-foreground">{t.loading}</p>
          </div>
        </div>
      </>
    )
  }

  if (!user && !showAuth) {
    return (
      <LandingPage 
        language={language} 
        setLanguage={setLanguage}
        onGetStarted={handleGetStarted}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    )
  }

  if (!user && showAuth) {
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
            --blue-50: #EFF6FF;
            --green-50: #ECFDF5;
            --orange-50: #FFF7ED;
            --blue-600: #2563EB;
            --green-600: #22C55E;
            --gray-900: #111827;
            --gray-800: #1F2937;
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
            --blue-50: #1E3A8A;
            --green-50: #064E3B;
            --orange-50: #7C2D12;
            --blue-600: #3B82F6;
            --green-600: #4ADE80;
            --gray-900: #0F172A;
            --gray-800: #1E293B;
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
          .text-foreground { color: var(--foreground); }
          .text-muted-foreground { color: var(--muted-foreground); }
          .text-white { color: #FFFFFF; }
          .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--blue-50), var(--green-50), var(--orange-50)); }
          .dark .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--gray-900), var(--gray-800), var(--gray-900)); }
          .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.2); }
          .dark .bg-black\\/40 { background-color: rgba(0, 0, 0, 0.4); }
          .min-h-screen { min-height: 100vh; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .rounded-2xl { border-radius: 1rem; }
          .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .max-w-md { max-width: 28rem; }
          .w-full { width: 100%; }
          .max-h-\\[90vh\\] { max-height: 90vh; }
          .overflow-y-auto { overflow-y: auto; }
          .border { border-width: 1px; }
          .border-border { border-color: var(--border); }
          .mb-6 { margin-bottom: 1.5rem; }
          .space-x-2 > * + * { margin-left: 0.5rem; }
          .space-x-3 > * + * { margin-left: 0.75rem; }
          .w-10 { width: 2.5rem; }
          .h-10 { height: 2.5rem; }
          .w-6 { width: 1.5rem; }
          .h-6 { height: 1.5rem; }
          .w-4 { width: 1rem; }
          .h-4 { height: 1rem; }
          .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--blue-600), var(--green-600)); }
          .rounded-xl { border-radius: 0.75rem; }
          .text-xl { font-size: 1.25rem; }
          .text-sm { font-size: 0.875rem; }
          .hover\\:text-foreground:hover { color: var(--foreground); }
          button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        `}</style>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                      <Bug className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl text-foreground">{t.appTitle}</h1>
                      <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={toggleTheme}
                      className="text-muted-foreground hover:text-foreground"
                      title={t.toggleTheme}
                    >
                      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAuth(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Auth language={language} />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

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
          --blue-50: #EFF6FF;
          --blue-400: #60A5FA;
          --blue-600: #2563EB;
          --green-50: #ECFDF5;
          --green-600: #22C55E;
          --orange-400: #FB923C;
          --slate-600: #475569;
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
          --blue-50: #1E3A8A;
          --blue-400: #60A5FA;
          --blue-600: #3B82F6;
          --green-50: #064E3B;
          --green-600: #4ADE80;
          --orange-400: #FB923C;
          --slate-600: #64748B;
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
        .text-destructive-foreground { color: var(--destructive-foreground); }
        .text-blue-600 { color: var(--blue-600); }
        .text-blue-400 { color: var(--blue-400); }
        .text-orange-400 { color: var(--orange-400); }
        .text-slate-600 { color: var(--slate-600); }
        .bg-green-50 { background-color: var(--green-50); }
        .text-green-600 { color: var(--green-600); }
        .hover\\:text-foreground:hover { color: var(--foreground); }
        .hover\\:bg-muted:hover { background-color: var(--muted); }
        button:focus-visible, select:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .min-h-screen { min-height: 100vh; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-40 { z-index: 40; }
        .max-w-7xl { max-width: 80rem; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .border-b { border-bottom-width: 1px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .p-2 { padding: 0.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .sm\\:px-6 { @media (min-width: 640px) { padding-left: 1.5rem; padding-right: 1.5rem; } }
        .lg\\:px-8 { @media (min-width: 1024px) { padding-left: 2rem; padding-right: 2rem; } }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .items-end { align-items: flex-end; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .space-x-1 > * + * { margin-left: 0.25rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-3 > * + * { margin-left: 0.75rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .h-16 { height: 4rem; }
        .h-8 { height: 2rem; }
        .w-8 { width: 2rem; }
        .h-6 { height: 1.5rem; }
        .w-6 { width: 1.5rem; }
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .text-xl { font-size: 1.25rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .mr-2 { margin-right: 0.5rem; }
        .w-auto { width: auto; }
        .w-full { width: 100%; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .sm\\:grid-cols-2 { @media (min-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .sm\\:grid-cols-3 { @media (min-width: 640px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        .sm\\:grid-cols-4 { @media (min-width: 640px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .gap-2 { gap: 0.5rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-md { border-radius: 0.375rem; }
        .transition-all { transition: all 0.3s ease; }
        .hidden { display: none; }
        .md\\:hidden { @media (min-width: 768px) { display: none; } }
        .md\\:flex { @media (min-width: 768px) { display: flex; } }
        .sm\\:inline { @media (min-width: 640px) { display: inline; } }
      `}</style>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Bug className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t.appTitle}</h1>
                  <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground"
                  title={t.toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-4 w-4 text-orange-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                </Button>

                <Select value={userRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-auto bg-background border-border text-foreground">
                    <UserCog className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{t.citizen}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="technician">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4" />
                        <span>{t.technicianRole}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>{t.adminRole}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                  <SelectTrigger className="w-auto bg-background border-border text-foreground">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-foreground">{userName}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs text-foreground border-border">
                        {t[`${userRole}Role` as keyof typeof t] || userRole}
                      </Badge>
                      {tempRole && (
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          Testing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.signOut}
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-card border-t border-border px-6 py-4">
                <div className="flex flex-col space-y-4">
                  <Button 
                    variant="ghost"
                    onClick={toggleTheme}
                    className="justify-start text-muted-foreground hover:text-foreground"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4 mr-2 text-orange-400" /> : <Moon className="h-4 w-4 mr-2 text-slate-600" />}
                    {t.toggleTheme}
                  </Button>

                  <Select value={userRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                      <UserCog className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{t.citizen}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="technician">
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4" />
                          <span>{t.technicianRole}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>{t.adminRole}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{userName}</span>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs text-foreground border-border">
                            {t[`${userRole}Role` as keyof typeof t] || userRole}
                          </Badge>
                          {tempRole && (
                            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                              Testing
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSignOut} 
                    variant="ghost" 
                    className="justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.signOut}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue={defaultTab} className="space-y-6" key={userRole}>
            <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-${availableTabs.length} gap-2 bg-muted p-2 rounded-lg sticky top-16 z-30 bg-opacity-90 backdrop-blur-sm`}>
              {availableTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center justify-center space-x-2 py-2 text-sm bg-background data-[state=active]:bg-primary data-[state=active]:text-destructive-foreground rounded-md transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {availableTabs.some(tab => tab.id === 'dashboard') && (
              <TabsContent value="dashboard">
                <Dashboard session={session} language={language} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'report') && (
              <TabsContent value="report">
                <ReportIssue session={session} language={language} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'my-issues') && (
              <TabsContent value="my-issues">
                <MyIssues session={session} language={language} tempRole={tempRole} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'my-tasks') && (
              <TabsContent value="my-tasks">
                <MyIssues session={session} language={language} viewMode="technician" tempRole={tempRole} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'technician') && (
              <TabsContent value="technician">
                <TechnicianPanel session={session} language={language} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'admin') && (
              <TabsContent value="admin">
                <AdminPanel session={session} language={language} tempRole={tempRole} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'users') && (
              <TabsContent value="users">
                <AdminPanel session={session} language={language} defaultView="users" tempRole={tempRole} />
              </TabsContent>
            )}

            {availableTabs.some(tab => tab.id === 'notifications') && (
              <TabsContent value="notifications">
                <NotificationsPanel session={session} language={language} userRole={userRole} tempRole={tempRole} />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </>
  )
}
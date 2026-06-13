import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { Auth } from '../components/Auth'
import { LandingPage } from '../components/LandingPage'
import { PublicDashboard } from '../components/PublicDashboard'
import { Dashboard } from '../components/Dashboard'
import { ReportIssue } from '../components/ReportIssue'
import { MyIssues } from '../components/MyIssues'
import { AdminPanel } from '../components/AdminPanel'
import { TechnicianPanel } from '../components/TechnicianPanel'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { Profile } from '../components/Profile'
import { Community } from '../components/Community'
import { ToastProvider, useToast } from '../components/ToastContext'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { User, MapPin, Settings, LogOut, Globe, Camera, Moon, Sun, Wrench, Bell, Users, UserCog, Menu, X, UserCircle, Heart } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
// import './index.css'

const translations = {
  en: {
    appTitle: 'CIRT',
    appSubtitle: 'Civic Issue Reporting',
    dashboard: 'Dashboard',
    reportIssue: 'Report Issue',
    myIssues: 'My Reports',
    myTasks: 'My Tasks',
    technician: 'Field Work',
    admin: 'Admin Panel',
    userManagement: 'Users',
    notifications: 'Notifications',
    community: 'Community',
    signOut: 'Sign Out',
    loading: 'Loading CIRT...',
    toggleTheme: 'Toggle theme',
    client: 'Client',
    citizen: 'Citizen',
    technicianRole: 'Technician',
    adminRole: 'Administrator',
    switchRole: 'Switch Role (Testing)',
    roleUpdated: 'Role updated successfully'
  },
  fr: {
    appTitle: 'CIRT',
    appSubtitle: 'Signalement de problèmes civiques',
    dashboard: 'Tableau de bord',
    reportIssue: 'Signaler un problème',
    myIssues: 'Mes rapports',
    myTasks: 'Mes tâches',
    technician: 'Travail terrain',
    admin: 'Panneau admin',
    userManagement: 'Utilisateurs',
    notifications: 'Notifications',
    community: 'Communauté',
    signOut: 'Déconnexion',
    loading: 'Chargement de CIRT...',
    toggleTheme: 'Basculer le thème',
    client: 'Client',
    citizen: 'Citoyen',
    technicianRole: 'Technicien',
    adminRole: 'Administrateur',
    switchRole: 'Changer de rôle (Test)',
    roleUpdated: 'Rôle mis à jour avec succès'
  }
}

function AppContent() {
  const location = useLocation()
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'fr'>('en')
  const [showAuth, setShowAuth] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [tempRole, setTempRole] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const { addToast } = useToast();

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
    addToast(translations[language].roleUpdated, 'success');
  }

  const t = translations[language]
  const userRole = tempRole || user?.user_metadata?.role || 'citizen'
  const userName = user?.user_metadata?.name || user?.email || 'User'

  const getTabsForRole = (role: string) => {
    const baseTabs = [
      { id: 'dashboard', label: t.dashboard, icon: MapPin },
      { id: 'community', label: t.community, icon: Heart },
      { id: 'notifications', label: t.notifications, icon: Bell }
    ]

    switch (role) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'admin', label: t.admin, icon: Settings },
          { id: 'users', label: t.userManagement, icon: Users }
        ]
      case 'technician':
        return [
          { id: 'technician', label: t.technician, icon: Wrench },
          { id: 'my-tasks', label: t.myTasks, icon: User },
          { id: 'community', label: t.community, icon: Heart },
          { id: 'notifications', label: t.notifications, icon: Bell }
        ]
      default:
        return [
          ...baseTabs,
          { id: 'report', label: t.reportIssue, icon: Camera },
          { id: 'my-issues', label: t.myIssues, icon: User }
        ]
    }
  }

  const availableTabs = getTabsForRole(userRole)
  const defaultPath = userRole === 'technician' ? '/technician' : '/dashboard'

  // Public Open Data dashboard - accessible without signing in.
  if (location.pathname === '/open-data') {
    return (
      <PublicDashboard
        language={language}
        setLanguage={setLanguage}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    )
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-foreground">{t.loading}</p>
          </div>
        </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <img src="/logo.svg" alt="CIRT Logo" className="h-10 w-10" />
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
                <Auth language={language} onAuthSuccess={() => addToast('Successfully signed in!', 'success')} />
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src="/logo.svg" alt="CIRT Logo" className="h-8 w-8" />
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
                  <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
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
                  <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <UserCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Profile</DialogTitle>
                      </DialogHeader>
                      <Profile session={session} language={language} />
                    </DialogContent>
                  </Dialog>
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

            {/* Page Navigation */}
            <nav className="hidden md:flex items-center space-x-1 h-12 border-t border-border overflow-x-auto">
              {availableTabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={`/${tab.id}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-card border-t border-border px-6 py-4 shadow-lg rounded-b-lg z-50">
                <div className="flex flex-col space-y-4">
                  <nav className="flex flex-col space-y-1 pb-2 border-b border-border">
                    {availableTabs.map((tab) => (
                      <NavLink
                        key={tab.id}
                        to={`/${tab.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`
                        }
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </NavLink>
                    ))}
                  </nav>

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
                    <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
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
                    <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfileDialogOpen(true)
                          setMobileMenuOpen(false)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
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
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            <Route path="/dashboard" element={<Dashboard session={session} language={language} />} />
            <Route path="/report" element={<ReportIssue session={session} language={language} />} />
            <Route path="/my-issues" element={<MyIssues session={session} language={language} tempRole={tempRole} />} />
            <Route path="/community" element={<Community session={session} language={language} userRole={userRole} tempRole={tempRole} />} />
            <Route path="/notifications" element={<NotificationsPanel session={session} language={language} userRole={userRole} tempRole={tempRole} />} />
            {userRole === 'technician' && (
              <>
                <Route path="/technician" element={<TechnicianPanel session={session} language={language} />} />
                <Route path="/my-tasks" element={<MyIssues session={session} language={language} viewMode="technician" tempRole={tempRole} />} />
              </>
            )}
            {userRole === 'admin' && (
              <>
                <Route path="/admin" element={<AdminPanel session={session} language={language} tempRole={tempRole} />} />
                <Route path="/users" element={<AdminPanel session={session} language={language} defaultView="users" tempRole={tempRole} />} />
              </>
            )}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
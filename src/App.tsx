import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { Inventory } from '../components/Inventory'
import { MarketplacePanel } from '../components/MarketplacePanel'
import { ToastProvider, useToast } from '../components/ToastContext'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetTrigger } from '../components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { User, MapPin, Settings, LogOut, Globe, Camera, Moon, Sun, Wrench, Bell, Users, UserCog, Menu, X, UserCircle, Heart, Boxes, Store, ChevronDown, MoreHorizontal } from 'lucide-react'
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
    inventory: 'Inventory',
    notifications: 'Notifications',
    community: 'Community',
    marketplace: 'Marketplace',
    signOut: 'Sign Out',
    loading: 'Loading CIRT...',
    toggleTheme: 'Toggle theme',
    client: 'Client',
    citizen: 'Citizen',
    technicianRole: 'Technician',
    adminRole: 'Administrator',
    switchRole: 'Switch Role (Testing)',
    roleUpdated: 'Role updated successfully',
    more: 'More'
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
    inventory: 'Inventaire',
    notifications: 'Notifications',
    community: 'Communauté',
    marketplace: 'Marché',
    signOut: 'Déconnexion',
    loading: 'Chargement de CIRT...',
    toggleTheme: 'Basculer le thème',
    client: 'Client',
    citizen: 'Citoyen',
    technicianRole: 'Technicien',
    adminRole: 'Administrateur',
    switchRole: 'Changer de rôle (Test)',
    roleUpdated: 'Rôle mis à jour avec succès',
    more: 'Plus'
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
      { id: 'community', label: t.community, icon: Heart }
    ]

    switch (role) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'admin', label: t.admin, icon: Settings },
          { id: 'users', label: t.userManagement, icon: Users },
          { id: 'inventory', label: t.inventory, icon: Boxes }
        ]
      case 'technician':
        return [
          { id: 'technician', label: t.technician, icon: Wrench },
          { id: 'my-tasks', label: t.myTasks, icon: User },
          { id: 'community', label: t.community, icon: Heart }
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
  // Cap primary nav slots at 5 so the pill nav/bottom tab bar can't grow
  // unbounded as roles gain more tabs - the rest surface in the sandwich
  // Sheet menu instead, alongside Marketplace/Notifications which always
  // live there regardless of device.
  const MAX_PRIMARY_TABS = 5
  const visibleTabs = availableTabs.slice(0, MAX_PRIMARY_TABS)
  const overflowTabs = availableTabs.slice(MAX_PRIMARY_TABS)
  // Marketplace/Notifications are deliberately kept out of the primary
  // pill nav / bottom tab bar on every device - they only surface inside
  // the hamburger Sheet.
  const sidebarOnlyTabs = [
    { id: 'notifications', label: t.notifications, icon: Bell },
    ...(userRole !== 'admin' ? [{ id: 'marketplace', label: t.marketplace, icon: Store }] : [])
  ]
  const sheetNavTabs = [...overflowTabs, ...sidebarOnlyTabs]
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
        <div className="min-h-screen bg-background bg-gradient-mesh flex items-center justify-center font-sans">
          <div className="text-center animate-fade-in">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-70 blur-xl animate-glow-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-lg">
                <img src="/logo.svg" alt="" className="h-9 w-9" />
              </div>
            </div>
            <p className="font-display text-muted-foreground">{t.loading}</p>
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
      <div className="min-h-screen bg-background bg-gradient-mesh flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md animate-scale-in">
            <div className="glass-card rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                      <img src="/logo.svg" alt="" className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="font-display text-xl font-bold text-foreground">{t.appTitle}</h1>
                      <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-muted-foreground hover:text-foreground"
                      title={t.toggleTheme}
                    >
                      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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
      <div className="min-h-screen bg-background font-sans transition-colors duration-300">
        {/* Header */}
        <header className="glass-nav sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 h-16">
              {/* Logo */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                  <img src="/logo.svg" alt="" className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">
                    <span className="text-gradient">{t.appTitle}</span>
                  </h1>
                  <p className="hidden sm:block text-xs text-muted-foreground truncate">{t.appSubtitle}</p>
                </div>
              </div>

              {/* Desktop pill navigation */}
              <nav className="hidden md:flex flex-1 items-center justify-center gap-1 rounded-full bg-muted/50 p-1 ring-1 ring-border/50 shadow-sm overflow-x-auto">
                {visibleTabs.map((tab) => (
                  <NavLink
                    key={tab.id}
                    to={`/${tab.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                      }`
                    }
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </NavLink>
                ))}
                {overflowTabs.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                          overflowTabs.some((tab) => location.pathname === `/${tab.id}`)
                            ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/25'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span>{t.more}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="min-w-[160px]">
                      {overflowTabs.map((tab) => (
                        <DropdownMenuItem key={tab.id} asChild>
                          <NavLink to={`/${tab.id}`} className="gap-2">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>

              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {/* Utility cluster */}
                <div className="flex items-center gap-0.5 rounded-full bg-muted/50 p-1 ring-1 ring-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
                    title={t.toggleTheme}
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
                        title={language.toUpperCase()}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[140px]">
                      <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr')}>
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
                        title={t.switchRole}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[180px]">
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{t.switchRole}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={userRole} onValueChange={handleRoleChange}>
                        <DropdownMenuRadioItem value="citizen" className="gap-2">
                          <User className="h-4 w-4" />
                          {t.citizen}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="technician" className="gap-2">
                          <Wrench className="h-4 w-4" />
                          {t.technicianRole}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="admin" className="gap-2">
                          <Settings className="h-4 w-4" />
                          {t.adminRole}
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(true)}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
                    title={t.more}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-border" />

                {/* Identity cluster */}
                <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group flex items-center gap-2.5 rounded-full pl-1 pr-2.5 py-1 transition-all hover:bg-muted/60">
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/40">
                          <AvatarFallback className="text-sm">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
                      </div>
                      <div className="hidden lg:flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium text-foreground">{userName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {t[`${userRole}Role` as keyof typeof t] || userRole}
                          </span>
                          {tempRole && (
                            <Badge variant="warning" className="px-1.5 py-0 text-[10px]">Test</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-y-0.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Profile</DialogTitle>
                    </DialogHeader>
                    <Profile session={session} language={language} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Mobile controls */}
              <div className="flex md:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground"
                  title={t.toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85%] sm:max-w-sm flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border p-4">
                      <SheetTitle className="font-display text-gradient">{t.appTitle}</SheetTitle>
                      <SheetDescription>{t.appSubtitle}</SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
                      <button
                        onClick={() => {
                          setProfileDialogOpen(true)
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 text-left transition-colors hover:bg-muted"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-foreground font-medium truncate">{userName}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {t[`${userRole}Role` as keyof typeof t] || userRole}
                            </Badge>
                            {tempRole && (
                              <Badge variant="warning" className="text-xs">Testing</Badge>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="flex flex-col gap-2">
                        <span className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t.switchRole}
                        </span>
                        <Select value={userRole} onValueChange={handleRoleChange}>
                          <SelectTrigger className="w-full gap-2 bg-muted/60 border-transparent">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="citizen">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{t.citizen}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="technician">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>{t.technicianRole}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span>{t.adminRole}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                          <SelectTrigger className="w-full gap-2 bg-muted/60 border-transparent">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {sheetNavTabs.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t.more}
                          </span>
                          {sheetNavTabs.map((tab) => (
                            <NavLink
                              key={tab.id}
                              to={`/${tab.id}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                  isActive
                                    ? 'bg-gradient-brand text-white shadow-md shadow-brand-500/25'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`
                              }
                            >
                              <tab.icon className="h-4 w-4" />
                              {tab.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>

                    <SheetFooter className="border-t border-border p-4">
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.signOut}
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            <Route path="/dashboard" element={<Dashboard session={session} language={language} />} />
            <Route path="/report" element={<ReportIssue session={session} language={language} />} />
            <Route path="/my-issues" element={<MyIssues session={session} language={language} tempRole={tempRole} />} />
            <Route path="/community" element={<Community session={session} language={language} userRole={userRole} tempRole={tempRole} />} />
            <Route path="/marketplace" element={<MarketplacePanel session={session} language={language} />} />
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
                <Route path="/inventory" element={<Inventory session={session} language={language} tempRole={tempRole} />} />
              </>
            )}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="glass-nav md:hidden fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-stretch justify-around">
            {visibleTabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={`/${tab.id}`}
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-center py-2.5 text-[11px] font-medium transition-colors min-w-0 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className={`flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 ${
                      isActive ? 'bg-gradient-brand text-white shadow-md shadow-brand-500/25' : ''
                    }`}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </motion.span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
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
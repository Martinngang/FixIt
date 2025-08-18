import { useState, useEffect } from 'react'
import { Auth } from '../components/Auth'
import { LandingPage } from '../components/LandingPage'
import { Dashboard } from '../components/Dashboard'
import { ReportIssue } from '../components/ReportIssue'
import { MyIssues } from '../components/MyIssues'
import { AdminPanel } from '../components/AdminPanel'
import { TechnicianPanel } from '../components/TechnicianPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { User, MapPin, Settings, LogOut, Bug, Globe, Camera, Moon, Sun, Wrench, Menu, X } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'

const translations = {
  en: {
    appTitle: 'FixIt',
    appSubtitle: 'Civic Issue Reporting',
    dashboard: 'Dashboard',
    reportIssue: 'Report Issue',
    myIssues: 'My Issues',
    technician: 'Technician',
    admin: 'Admin Panel',
    signOut: 'Sign Out',
    loading: 'Loading FixIt...',
    toggleTheme: 'Toggle theme',
    citizen: 'Citizen',
    technicianRole: 'Technician',
    adminRole: 'Administrator'
  },
  fr: {
    appTitle: 'FixIt',
    appSubtitle: 'Signalement de problèmes civiques',
    dashboard: 'Tableau de bord',
    reportIssue: 'Signaler un problème',
    myIssues: 'Mes problèmes',
    technician: 'Technicien',
    admin: 'Panneau admin',
    signOut: 'Déconnexion',
    loading: 'Chargement de FixIt...',
    toggleTheme: 'Basculer le thème',
    citizen: 'Citoyen',
    technicianRole: 'Technicien',
    adminRole: 'Administrateur'
  }
}

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'fr'>('en')
  const [showAuth, setShowAuth] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
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
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    setShowAuth(true)
    setMobileMenuOpen(false)
  }

  const t = translations[language]
  const userRole = user?.user_metadata?.role || 'citizen'
  const userName = user?.user_metadata?.name || user?.email || 'User'

  const getTabsForRole = (role: string) => {
    const baseTabs = [
      { id: 'dashboard', label: t.dashboard, icon: MapPin },
      { id: 'report', label: t.reportIssue, icon: Camera },
      { id: 'my-issues', label: t.myIssues, icon: User }
    ]

    switch (role) {
      case 'admin':
        return [
          ...baseTabs,
          { id: 'technician', label: t.technician, icon: Wrench },
          { id: 'admin', label: t.admin, icon: Settings }
        ]
      case 'technician':
        return [
          { id: 'dashboard', label: t.dashboard, icon: MapPin },
          { id: 'technician', label: t.technician, icon: Wrench },
          { id: 'my-issues', label: t.myIssues, icon: User }
        ]
      default:
        return baseTabs
    }
  }

  const availableTabs = getTabsForRole(userRole)
  const defaultTab = userRole === 'technician' ? 'technician' : 'dashboard'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border">
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
                    ×
                  </Button>
                </div>
              </div>
              <Auth language={language} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl text-foreground">{t.appTitle}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{t.appSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Controls */}
              <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 sm:p-3 text-muted-foreground hover:text-foreground min-w-[40px] min-h-[40px]"
                  title={t.toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
                
                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                  <SelectTrigger className="w-auto min-w-[100px] text-xs sm:text-sm">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-xs sm:text-sm">English</SelectItem>
                    <SelectItem value="fr" className="text-xs sm:text-sm">Français</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs sm:text-sm text-foreground">{userName}</span>
                    <Badge variant="outline" className="text-xs mt-1">
                      {t[`${userRole}Role` as keyof typeof t] || userRole}
                    </Badge>
                  </div>
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                
                <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t.signOut}
                </Button>
              </div>
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 sm:p-3 min-w-[40px] min-h-[40px]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-card border-t border-border py-4">
              <div className="px-4 space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full flex justify-start text-sm"
                  title={t.toggleTheme}
                >
                  <span className="flex items-center">
                    {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {t.toggleTheme}
                  </span>
                </Button>
                
                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                  <SelectTrigger className="w-full text-sm">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-sm">English</SelectItem>
                    <SelectItem value="fr" className="text-sm">Français</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{userName}</span>
                    <Badge variant="outline" className="text-xs mt-1">
                      {t[`${userRole}Role` as keyof typeof t] || userRole}
                    </Badge>
                  </div>
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <Button onClick={handleSignOut} variant="ghost" className="w-full flex justify-start text-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.signOut}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
            {availableTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard session={session} language={language} />
          </TabsContent>

          {availableTabs.some(tab => tab.id === 'report') && (
            <TabsContent value="report">
              <ReportIssue session={session} language={language} />
            </TabsContent>
          )}

          <TabsContent value="my-issues">
            <MyIssues session={session} language={language} />
          </TabsContent>

          {availableTabs.some(tab => tab.id === 'technician') && (
            <TabsContent value="technician">
              <TechnicianPanel session={session} language={language} />
            </TabsContent>
          )}

          {availableTabs.some(tab => tab.id === 'admin') && (
            <TabsContent value="admin">
              <AdminPanel session={session} language={language} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
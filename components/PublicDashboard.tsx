import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Button } from "./ui/button.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Progress } from "./ui/progress.tsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import {
  ArrowLeft, AlertTriangle, MapPin, Calendar, Activity, TrendingUp,
  Flame, Copy, Check, Globe, Moon, Sun,
} from 'lucide-react'
import { projectId, publicAnonKey } from "../utils/supabase/info.ts"

interface Analytics {
  totalIssues: number
  recentIssues: number
  resolutionRate: number
  avgResolutionDays: number
  dailyReports: Array<{ date: string; count: number }>
  categoryBreakdown: Record<string, number>
  priorityDistribution: Record<string, number>
  statusFlow: Record<string, number>
}

interface Hotspot {
  location: string
  totalIssues: number
  recentIssues: number
  flaggedIssues: number
  topCategory: string
  categories: Record<string, number>
  avgResolutionDays: number | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const translations = {
  en: {
    backToHome: 'Back to Home',
    title: 'Open Data & Transparency',
    subtitle: 'Aggregated, anonymized civic issue data, published in the interest of accountability. No personal information is included.',
    loading: 'Loading transparency data...',
    totalIssues: 'Total Issues',
    last30Days: 'reported in the last 30 days',
    resolutionRate: 'Resolution Rate',
    resolvedOf: 'resolved',
    avgResolutionTime: 'Avg. Resolution Time',
    days: 'days',
    activeHotspots: 'Active Hotspots',
    hotspotsDesc: 'locations with recurring reports',
    statusDistribution: 'Status Distribution',
    categoryBreakdown: 'Issues by Category',
    dailyTrend: 'Daily Reports (Last 30 Days)',
    topProblemAreas: 'Top Problem Areas',
    topProblemAreasDesc: 'Locations with two or more reported issues, ranked by total reports',
    noHotspots: 'No recurring problem areas detected yet.',
    issuesLabel: 'issues',
    topCategory: 'Top category',
    avgResolution: 'Avg. resolution',
    apiTitle: 'Open API for Developers',
    apiDesc: 'A read-only, anonymized API for researchers, urban planners, and third-party developers. Every request must include the public anon key below as a Bearer token.',
    endpoint: 'Endpoint',
    descriptionLabel: 'Description',
    anonKeyLabel: 'Public Anon Key (Bearer Token)',
    copy: 'Copy',
    copied: 'Copied',
    toggleTheme: 'Toggle theme',
    statuses: {
      reported: 'Reported',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
    } as Record<string, string>,
    endpoints: [
      { path: '/public/issues', desc: 'Paginated, anonymized list of reported issues (filter by status/category, paginate with limit/offset).' },
      { path: '/public/stats', desc: 'Aggregate counts of issues by status, category, and priority.' },
      { path: '/public/analytics', desc: 'Resolution rate, average resolution time, and reporting trends.' },
      { path: '/public/hotspots', desc: 'Recurring problem locations with at least two reported issues.' },
    ],
  },
  fr: {
    backToHome: 'Retour à l\'accueil',
    title: 'Données ouvertes et transparence',
    subtitle: 'Données civiques agrégées et anonymisées, publiées dans un souci de redevabilité. Aucune information personnelle n\'est incluse.',
    loading: 'Chargement des données de transparence...',
    totalIssues: 'Total des signalements',
    last30Days: 'signalés au cours des 30 derniers jours',
    resolutionRate: 'Taux de résolution',
    resolvedOf: 'résolus',
    avgResolutionTime: 'Temps de résolution moyen',
    days: 'jours',
    activeHotspots: 'Points chauds actifs',
    hotspotsDesc: 'emplacements avec signalements récurrents',
    statusDistribution: 'Répartition par statut',
    categoryBreakdown: 'Problèmes par catégorie',
    dailyTrend: 'Signalements quotidiens (30 derniers jours)',
    topProblemAreas: 'Principales zones à problèmes',
    topProblemAreasDesc: 'Emplacements avec au moins deux signalements, classés par nombre total',
    noHotspots: 'Aucune zone à problèmes récurrente détectée pour le moment.',
    issuesLabel: 'signalements',
    topCategory: 'Catégorie principale',
    avgResolution: 'Résolution moyenne',
    apiTitle: 'API ouverte pour développeurs',
    apiDesc: 'Une API en lecture seule et anonymisée pour les chercheurs, urbanistes et développeurs tiers. Chaque requête doit inclure la clé anonyme publique ci-dessous en tant que jeton Bearer.',
    endpoint: 'Point de terminaison',
    descriptionLabel: 'Description',
    anonKeyLabel: 'Clé anonyme publique (jeton Bearer)',
    copy: 'Copier',
    copied: 'Copié',
    toggleTheme: 'Basculer le thème',
    statuses: {
      reported: 'Signalé',
      'in-progress': 'En cours',
      resolved: 'Résolu',
      rejected: 'Rejeté',
    } as Record<string, string>,
    endpoints: [
      { path: '/public/issues', desc: 'Liste paginée et anonymisée des problèmes signalés (filtrer par statut/catégorie, paginer avec limit/offset).' },
      { path: '/public/stats', desc: 'Totaux agrégés des problèmes par statut, catégorie et priorité.' },
      { path: '/public/analytics', desc: 'Taux de résolution, temps de résolution moyen et tendances de signalement.' },
      { path: '/public/hotspots', desc: 'Emplacements à problèmes récurrents avec au moins deux signalements.' },
    ],
  },
}

export function PublicDashboard({
  language = 'en',
  setLanguage,
  isDarkMode,
  toggleTheme,
}: {
  language?: 'en' | 'fr'
  setLanguage: (lang: 'en' | 'fr') => void
  isDarkMode: boolean
  toggleTheme: () => void
}) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const t = translations[language]
  const apiBaseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-accecacf`

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [analyticsResponse, hotspotsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/public/analytics`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
          fetch(`${apiBaseUrl}/public/hotspots`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
        ])

        if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics')
        if (!hotspotsResponse.ok) throw new Error('Failed to fetch hotspots')

        const analyticsData = await analyticsResponse.json()
        const hotspotsData = await hotspotsResponse.json()

        setAnalytics(analyticsData.analytics)
        setHotspots(hotspotsData.hotspots || [])
      } catch (err: any) {
        console.error('Public dashboard fetch error:', err)
        setError(err.message || 'Failed to load transparency data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(publicAnonKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access denied - nothing to recover from here.
    }
  }

  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({ name, value })) : []
  const statusData = analytics ? Object.entries(analytics.statusFlow).map(([name, value]) => ({
    name: t.statuses[name] || name,
    value,
  })) : []
  const trendData = analytics ? analytics.dailyReports.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    reports: item.count,
  })) : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="CIRT Logo" className="h-8 w-8" />
            <h1 className="text-lg font-bold text-foreground">{t.title}</h1>
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
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <p className="text-muted-foreground max-w-3xl">{t.subtitle}</p>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
            <p className="text-center text-muted-foreground">{t.loading}</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* KPI cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalIssues}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{analytics.totalIssues}</div>
                    <p className="text-xs text-muted-foreground">{analytics.recentIssues} {t.last30Days}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.resolutionRate}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{analytics.resolutionRate}%</div>
                    <Progress value={analytics.resolutionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {analytics.statusFlow.resolved || 0} / {analytics.totalIssues} {t.resolvedOf}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.avgResolutionTime}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{analytics.avgResolutionDays} {t.days}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.activeHotspots}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-orange-500" />
                      {hotspots.length}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.hotspotsDesc}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.categoryBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.statusDistribution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statusData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{t.dailyTrend}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reports" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hotspots */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>{t.topProblemAreas}</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">{t.topProblemAreasDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {hotspots.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.noHotspots}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotspots.map((hotspot) => (
                      <div key={hotspot.location} className="border border-border rounded-lg p-4 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{hotspot.location}</span>
                          </div>
                          <Badge variant="outline" className="text-foreground border-border">
                            {hotspot.totalIssues} {t.issuesLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{t.topCategory}: {hotspot.topCategory}</span>
                          {hotspot.avgResolutionDays !== null && (
                            <span>{t.avgResolution}: {hotspot.avgResolutionDays} {t.days}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Open API docs */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Activity className="h-5 w-5" />
                  <span>{t.apiTitle}</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">{t.apiDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{t.anonKeyLabel}</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-muted text-foreground rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
                      {publicAnonKey}
                    </code>
                    <Button variant="outline" size="sm" onClick={handleCopyKey} className="bg-background border-border text-foreground hover:bg-muted">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? t.copied : t.copy}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {t.endpoints.map((endpoint) => (
                    <div key={endpoint.path} className="border border-border rounded-lg p-3 bg-background">
                      <code className="text-sm font-medium text-primary">GET {apiBaseUrl}{endpoint.path}</code>
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>CIRT Open Data &mdash; updated in real time</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

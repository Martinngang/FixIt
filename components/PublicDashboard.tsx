import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { Progress } from "./ui/progress"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { EmptyState } from "./ui/empty-state"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import {
  ArrowLeft, AlertTriangle, MapPin, Calendar, Activity, TrendingUp,
  Flame, Copy, Check, Globe, Moon, Sun, Box, Loader2, RotateCw,
} from 'lucide-react'
import { projectId, publicAnonKey } from "../utils/supabase/info"
import { STATUS_COLORS, isWebGLAvailable, type CityModelIssue } from "../utils/cityModel"

const CityModel3D = lazy(() =>
  import('./CityModel3D').then((m) => ({ default: m.CityModel3D }))
)

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

const COLORS = ['#6366F1', '#22D3EE', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E']

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
    cityModelTitle: '3D City Model',
    cityModelDesc: 'Explore reported issues plotted across an interactive 3D city. Drag to rotate, scroll to zoom, and click a marker for details. The skyline is a stylized representation; integration with official GIS/BIM city models is a future enhancement.',
    loadingModel: 'Loading 3D city model...',
    webglUnavailable: 'Your browser or device does not support 3D rendering (WebGL). Try a recent version of Chrome, Edge, or Firefox to view the interactive city model.',
    noLocationData: 'No issues with location data are available to plot yet.',
    filterCategory: 'Category',
    filterStatus: 'Status',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    autoRotate: 'Auto-rotate',
    legendTitle: 'Legend',
    legendPriority: 'Marker height reflects priority (low / medium / high)',
    clickHint: 'Click a marker on the model to see issue details here.',
    issueDetails: 'Issue Details',
    reportedOn: 'Reported on',
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
    cityModelTitle: 'Modèle 3D de la ville',
    cityModelDesc: 'Explorez les problèmes signalés sur une ville 3D interactive. Glissez pour tourner, faites défiler pour zoomer, et cliquez sur un repère pour voir les détails. La silhouette urbaine est une représentation stylisée; l\'intégration avec les modèles SIG/BIM officiels est une amélioration future.',
    loadingModel: 'Chargement du modèle 3D de la ville...',
    webglUnavailable: 'Votre navigateur ou appareil ne prend pas en charge le rendu 3D (WebGL). Essayez une version récente de Chrome, Edge ou Firefox pour voir le modèle interactif.',
    noLocationData: 'Aucun problème avec des données de localisation n\'est encore disponible.',
    filterCategory: 'Catégorie',
    filterStatus: 'Statut',
    allCategories: 'Toutes les catégories',
    allStatuses: 'Tous les statuts',
    autoRotate: 'Rotation automatique',
    legendTitle: 'Légende',
    legendPriority: 'La hauteur du repère reflète la priorité (faible / moyenne / élevée)',
    clickHint: 'Cliquez sur un repère du modèle pour afficher les détails du problème ici.',
    issueDetails: 'Détails du problème',
    reportedOn: 'Signalé le',
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

  const [cityIssues, setCityIssues] = useState<CityModelIssue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<CityModelIssue | null>(null)
  const [cityCategory, setCityCategory] = useState('all')
  const [cityStatus, setCityStatus] = useState('all')
  const [autoRotate, setAutoRotate] = useState(false)
  const [webglOk] = useState(() => isWebGLAvailable())

  const t = translations[language]
  const apiBaseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-accecacf`

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [analyticsResponse, hotspotsResponse, issuesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/public/analytics`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
          fetch(`${apiBaseUrl}/public/hotspots`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
          fetch(`${apiBaseUrl}/public/issues?limit=200`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
        ])

        if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics')
        if (!hotspotsResponse.ok) throw new Error('Failed to fetch hotspots')
        if (!issuesResponse.ok) throw new Error('Failed to fetch issues')

        const analyticsData = await analyticsResponse.json()
        const hotspotsData = await hotspotsResponse.json()
        const issuesData = await issuesResponse.json()

        setAnalytics(analyticsData.analytics)
        setHotspots(hotspotsData.hotspots || [])
        setCityIssues((issuesData.issues || []).filter((issue: CityModelIssue) => issue.coordinates))
      } catch (err: any) {
        console.error('Public dashboard fetch error:', err)
        setError(err.message || 'Failed to load transparency data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const cityCategories = useMemo(
    () => Array.from(new Set(cityIssues.map((issue) => issue.category))).sort(),
    [cityIssues]
  )

  const filteredCityIssues = useMemo(() => {
    return cityIssues.filter((issue) => {
      if (cityCategory !== 'all' && issue.category !== cityCategory) return false
      if (cityStatus !== 'all' && issue.status !== cityStatus) return false
      return true
    })
  }, [cityIssues, cityCategory, cityStatus])

  useEffect(() => {
    setSelectedIssue(null)
  }, [cityCategory, cityStatus])

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
    <div className="min-h-screen bg-background font-sans">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow shrink-0">
              <img src="/logo.svg" alt="" className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold text-gradient truncate">{t.title}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t.backToHome}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
        <p className="text-muted-foreground max-w-3xl">{t.subtitle}</p>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
            <p className="text-center text-muted-foreground">{t.loading}</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* KPI cards */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalIssues}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display font-bold text-foreground">{analytics.totalIssues}</div>
                    <p className="text-xs text-muted-foreground">{analytics.recentIssues} {t.last30Days}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.resolutionRate}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-display font-bold text-foreground">{analytics.resolutionRate}%</div>
                    <Progress value={analytics.resolutionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {analytics.statusFlow.resolved || 0} / {analytics.totalIssues} {t.resolvedOf}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.avgResolutionTime}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display font-bold text-foreground">{analytics.avgResolutionDays} {t.days}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t.activeHotspots}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                      <Flame className="h-5 w-5 text-warning" />
                      {hotspots.length}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.hotspotsDesc}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.categoryBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#6366F1"
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

              <Card>
                <CardHeader>
                  <CardTitle>{t.statusDistribution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statusData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-info" />
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
                    <Line type="monotone" dataKey="reports" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3D City Model */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  <span>{t.cityModelTitle}</span>
                </CardTitle>
                <CardDescription>{t.cityModelDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">{t.filterCategory}</Label>
                    <Select value={cityCategory} onValueChange={setCityCategory}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allCategories}</SelectItem>
                        {cityCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">{t.filterStatus}</Label>
                    <Select value={cityStatus} onValueChange={setCityStatus}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allStatuses}</SelectItem>
                        {Object.keys(t.statuses).map((status) => (
                          <SelectItem key={status} value={status}>{t.statuses[status]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="city-auto-rotate" checked={autoRotate} onCheckedChange={setAutoRotate} />
                    <Label htmlFor="city-auto-rotate" className="text-sm flex items-center gap-1.5">
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>{t.autoRotate}</span>
                    </Label>
                  </div>
                </div>

                {!webglOk ? (
                  <Alert>
                    <AlertDescription>{t.webglUnavailable}</AlertDescription>
                  </Alert>
                ) : filteredCityIssues.length === 0 ? (
                  <EmptyState icon={Box} title={t.noLocationData} size="sm" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 h-[320px] sm:h-[420px] rounded-xl overflow-hidden border border-border">
                      <Suspense
                        fallback={
                          <div className="h-full w-full flex items-center justify-center gap-2 bg-muted">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="text-muted-foreground">{t.loadingModel}</span>
                          </div>
                        }
                      >
                        <CityModel3D
                          issues={filteredCityIssues}
                          selectedIssueId={selectedIssue?.id || null}
                          onSelectIssue={setSelectedIssue}
                          autoRotate={autoRotate}
                          isDarkMode={isDarkMode}
                        />
                      </Suspense>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">{t.legendTitle}</p>
                        <div className="space-y-1.5">
                          {Object.entries(STATUS_COLORS).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                              <span>{t.statuses[status] || status}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{t.legendPriority}</p>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground mb-2">{t.issueDetails}</p>
                        {selectedIssue ? (
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">{selectedIssue.title}</p>
                            <p className="text-muted-foreground capitalize">{selectedIssue.category} · {selectedIssue.location}</p>
                            <p className="text-muted-foreground">{t.statuses[selectedIssue.status] || selectedIssue.status}</p>
                            <p className="text-muted-foreground">
                              {t.reportedOn} {new Date(selectedIssue.reportedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t.clickHint}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hotspots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span>{t.topProblemAreas}</span>
                </CardTitle>
                <CardDescription>{t.topProblemAreasDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {hotspots.length === 0 ? (
                  <EmptyState icon={MapPin} title={t.noHotspots} size="sm" />
                ) : (
                  <div className="space-y-3">
                    {hotspots.map((hotspot) => (
                      <div key={hotspot.location} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{hotspot.location}</span>
                          </div>
                          <Badge variant="outline">
                            {hotspot.totalIssues} {t.issuesLabel}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>{t.apiTitle}</span>
                </CardTitle>
                <CardDescription>{t.apiDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{t.anonKeyLabel}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <code className="flex-1 min-w-0 text-xs bg-muted text-foreground rounded-xl px-3 py-2 overflow-x-auto whitespace-nowrap">
                      {publicAnonKey}
                    </code>
                    <Button variant="outline" size="sm" onClick={handleCopyKey} className="self-start sm:self-auto">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? t.copied : t.copy}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {t.endpoints.map((endpoint) => (
                    <div key={endpoint.path} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <code className="text-sm font-medium text-primary break-all">GET {apiBaseUrl}{endpoint.path}</code>
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>CIRT Open Data &mdash; updated in real time</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

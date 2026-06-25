
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { MapPin, Clock, User, AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Calendar, Activity, ThumbsUp } from 'lucide-react'
import { projectId, publicAnonKey } from "../utils/supabase/info"
import { Comments } from "./Comments"
import { EntityCard } from "./ui/entity-card"
import { StatusBadge } from "./ui/status-badge"
import { EmptyState } from "./ui/empty-state"

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
  photoUrl?: string
  coordinates?: { lat: number; lng: number }
  upvotes?: number
  upvotedBy?: string[]
}

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

const CHART_COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#F43F5E']
const AXIS_COLOR = '#94A3B8'

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.75rem',
  color: 'hsl(var(--foreground))',
  fontSize: '0.875rem',
}


const translations = {
  en: {
    dashboard: 'Dashboard',
    overview: 'Overview',
    analytics: 'Analytics',
    recentIssues: 'Recent Issues',
    totalIssues: 'Total Issues',
    reported: 'Reported',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    resolutionRate: 'Resolution Rate',
    avgResolutionTime: 'Avg Resolution Time',
    days: 'days',
    issuesByCategory: 'Issues by Category',
    issuesByPriority: 'Issues by Priority',
    recentActivity: 'Recent Activity',
    noIssues: 'No issues reported yet',
    noIssuesDesc: 'Be the first to report a local issue',
    location: 'Location',
    reportedBy: 'Reported by',
    category: 'Category',
    adminNote: 'Admin Note',
    upvote: 'Upvote'
  },
  fr: {
    dashboard: 'Tableau de bord',
    overview: 'Aperçu',
    analytics: 'Analytiques',
    recentIssues: 'Problèmes récents',
    totalIssues: 'Total des problèmes',
    reported: 'Signalés',
    inProgress: 'En cours',
    resolved: 'Résolus',
    resolutionRate: 'Taux de résolution',
    avgResolutionTime: 'Temps de résolution moyen',
    days: 'jours',
    issuesByCategory: 'Problèmes par catégorie',
    issuesByPriority: 'Problèmes par priorité',
    recentActivity: 'Activité récente',
    noIssues: 'Aucun problème signalé',
    noIssuesDesc: 'Soyez le premier à signaler un problème local',
    location: 'Emplacement',
    reportedBy: 'Signalé par',
    category: 'Catégorie',
    adminNote: 'Note admin',
    upvote: 'Voter'
  }
}

export function Dashboard({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const t = translations[language]

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch issues and analytics in parallel
      const [issuesResponse, analyticsResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }).catch(err => {
          console.error('Issues fetch error:', err)
          throw new Error('Failed to fetch issues')
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/analytics`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
          }
        }).catch(err => {
          console.error('Analytics fetch error:', err)
          throw new Error('Failed to fetch analytics')
        })
      ])

      if (!issuesResponse.ok) {
        const errorData = await issuesResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Issues API error: ${issuesResponse.status} ${issuesResponse.statusText}`)
      }

      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Analytics API error: ${analyticsResponse.status} ${analyticsResponse.statusText}`)
      }

      const issuesData = await issuesResponse.json()
      const analyticsData = await analyticsResponse.json()

      setIssues(issuesData.issues || [])
      setAnalytics(analyticsData.analytics)
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpvote = async (issueId: string) => {
    if (!session?.access_token) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setIssues(prev => prev.map(issue => issue.id === issueId ? data.issue : issue))
    } catch (err) {
      console.error('Upvote error:', err)
    }
  }

  // Prepare chart data
  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
    name, value
  })) : []

  const priorityData = analytics ? Object.entries(analytics.priorityDistribution).map(([name, value]) => ({
    name, value
  })) : []

  const statusData = analytics ? Object.entries(analytics.statusFlow).map(([name, value]) => ({
    name, value
  })) : []

  const trendData = analytics ? analytics.dailyReports.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    reports: item.count
  })) : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="space-y-4">
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
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="h-4 w-4" />
            <span>{t.overview}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>{t.analytics}</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{t.recentIssues}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.totalIssues}</p>
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">{analytics.totalIssues}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.recentIssues} in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-warning" />
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.reported}</p>
                    <div className="h-9 w-9 rounded-xl bg-warning/15 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    {analytics.statusFlow.reported || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalIssues ? Math.round(((analytics.statusFlow.reported || 0) / analytics.totalIssues) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-info" />
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.inProgress}</p>
                    <div className="h-9 w-9 rounded-xl bg-info/15 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-info" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    {analytics.statusFlow['in-progress'] || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalIssues ? Math.round(((analytics.statusFlow['in-progress'] || 0) / analytics.totalIssues) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 bg-success" />
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.resolved}</p>
                    <div className="h-9 w-9 rounded-xl bg-success/15 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    {analytics.statusFlow.resolved || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.resolutionRate}% resolution rate
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Metrics */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.resolutionRate}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-display font-bold text-foreground">{analytics.resolutionRate}%</span>
                    <span className="text-sm text-muted-foreground text-right">
                      {analytics.statusFlow.resolved || 0} of {analytics.totalIssues} resolved
                    </span>
                  </div>
                  <Progress value={analytics.resolutionRate} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.avgResolutionTime}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {analytics.avgResolutionDays} {t.days}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Average time to resolve issues
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.issuesByCategory}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.issuesByPriority}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} strokeOpacity={0.15} />
                    <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                    <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Daily Reports Trend (Last 30 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} strokeOpacity={0.15} />
                  <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                  <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="reports" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} strokeOpacity={0.15} />
                  <XAxis type="number" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6 mt-6">
          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentIssues}</CardTitle>
              <CardDescription>
                All reported issues in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <EmptyState icon={MapPin} title={t.noIssues} description={t.noIssuesDesc} />
              ) : (
                <div className="space-y-4">
                  {issues.slice(0, 10).map((issue) => (
                    <EntityCard
                      key={issue.id}
                      title={issue.title}
                      subtitle={issue.description}
                      badges={[
                        <StatusBadge key="priority" kind="priority" value={issue.priority} label={issue.priority} />,
                        <StatusBadge key="status" kind="status" value={issue.status} label={issue.status.replace('-', ' ')} />,
                      ]}
                      metadata={[
                        { icon: MapPin, label: issue.location },
                        { icon: User, label: issue.reporterName },
                        { icon: Clock, label: new Date(issue.reportedAt).toLocaleDateString() },
                      ]}
                      photoUrl={issue.photoUrl}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {t.category}: {issue.category}
                        </span>
                        <div className="flex items-center gap-3">
                          {issue.adminNote && (
                            <span className="text-xs text-info">
                              {t.adminNote}: {issue.adminNote}
                            </span>
                          )}
                          <Button
                            variant={issue.upvotedBy?.includes(session?.user?.id) ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 gap-1 px-2"
                            onClick={() => handleUpvote(issue.id)}
                            disabled={!session?.access_token}
                            title={t.upvote}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {issue.upvotes || 0}
                          </Button>
                          <Comments entityType="issue" entityId={issue.id} session={session} language={language} />
                        </div>
                      </div>
                    </EntityCard>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

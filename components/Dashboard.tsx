import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MapPin, Clock, User, AlertTriangle, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, Activity, Sun, Moon } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'in-progress' | 'resolved' | 'rejected';
  reportedBy: string;
  reporterName: string;
  reportedAt: string;
  updatedAt: string;
  adminNote?: string;
  photoUrl?: string;
  coordinates?: { lat: number; lng: number };
}

interface Analytics {
  totalIssues: number;
  recentIssues: number;
  resolutionRate: number;
  avgResolutionDays: number;
  dailyReports: Array<{ date: string; count: number }>;
  categoryBreakdown: Record<string, number>;
  priorityDistribution: Record<string, number>;
  statusFlow: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'reported':
      return <AlertCircle className="h-4 w-4" />;
    case 'in-progress':
      return <Clock className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'reported':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
    case 'resolved':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  }
};

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
    toggleTheme: 'Toggle theme'
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
    toggleTheme: 'Basculer le thème'
  }
};

export function Dashboard({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = translations[language];

  // Theme toggle logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [issuesResponse, analyticsResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }).catch(err => {
          console.error('Issues fetch error:', err);
          throw new Error('Failed to fetch issues');
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/analytics`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }).catch(err => {
          console.error('Analytics fetch error:', err);
          throw new Error('Failed to fetch analytics');
        })
      ]);

      if (!issuesResponse.ok) {
        const errorData = await issuesResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Issues API error: ${issuesResponse.status} ${issuesResponse.statusText}`);
      }

      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Analytics API error: ${analyticsResponse.status} ${analyticsResponse.statusText}`);
      }

      const issuesData = await issuesResponse.json();
      const analyticsData = await analyticsResponse.json();

      setIssues(issuesData.issues || []);
      setAnalytics(analyticsData.analytics);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data
  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
    name, value
  })) : [];

  const priorityData = analytics ? Object.entries(analytics.priorityDistribution).map(([name, value]) => ({
    name, value
  })) : [];

  const statusData = analytics ? Object.entries(analytics.statusFlow).map(([name, value]) => ({
    name, value
  })) : [];

  const trendData = analytics ? analytics.dailyReports.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    reports: item.count
  })) : [];

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
          --gray-800: #1F2A44;
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
          --gray-800: #D1D5DB;
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
        button:focus-visible, input:focus-visible {
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
        .h-2 { height: 0.5rem; }
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .h-5 { height: 1.25rem; }
        .w-5 { width: 1.25rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-xs { font-size: 0.75rem; }
        .font-medium { font-weight: 500; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-x-1 > * + * { margin-left: 0.25rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .p-4 { padding: 1rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .ml-1 { margin-left: 0.25rem; }
        .ml-4 { margin-left: 1rem; }
        .pb-3 { padding-bottom: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .max-w-sm { max-width: 24rem; }
        .w-full { width: 100%; }
        .h-32 { height: 8rem; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .md\\:grid-cols-4 { @media (min-width: 768px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .lg\\:grid-cols-2 { @media (min-width: 1024px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .top-1\\/2 { top: 50%; }
        .right-2 { right: 0.5rem; }
        .transform { transform: translate(0, 0); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .transition-all { transition: all 0.3s ease; }
        .hover\\:bg-muted:hover { background-color: var(--muted); }
        .hover\\:bg-primary\\/90:hover { background-color: rgba(59, 130, 246, 0.9); }
      `}</style>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-8xl mx-auto">
          {/* Theme Toggle Button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-3 rounded-lg hover:bg-muted transition-all duration-300 min-w-[48px] min-h-[48px]"
              title={t.toggleTheme}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-orange-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>
          </div>

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
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
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
          ) : error ? (
            <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted">
                  <TabsTrigger value="overview" className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Activity className="h-4 w-4" />
                    <span>{t.overview}</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-white">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t.analytics}</span>
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-white">
                    <MapPin className="h-4 w-4" />
                    <span>{t.recentIssues}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Key Metrics */}
                  {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{t.totalIssues}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-foreground">{analytics.totalIssues}</div>
                          <p className="text-xs text-muted-foreground">
                            {analytics.recentIssues} in last 30 days
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{t.reported}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {analytics.statusFlow.reported || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{t.inProgress}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {analytics.statusFlow['in-progress'] || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{t.resolved}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {analytics.statusFlow.resolved || 0}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">{t.resolutionRate}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-2xl font-bold text-foreground">{analytics.resolutionRate}%</span>
                              <span className="text-sm text-muted-foreground">
                                {analytics.statusFlow.resolved || 0} of {analytics.totalIssues} resolved
                              </span>
                            </div>
                            <Progress value={analytics.resolutionRate} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">{t.avgResolutionTime}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-foreground">
                            {analytics.avgResolutionDays} {t.days}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Average time to resolve issues
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Quick Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border-border shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-foreground">{t.issuesByCategory}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
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
                        <CardTitle className="text-foreground">{t.issuesByPriority}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {/* Trend Analysis */}
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Calendar className="h-5 w-5" />
                        <span>Daily Reports Trend (Last 30 Days)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="reports" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Status Flow */}
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-foreground">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="issues" className="space-y-6">
                  {/* Issues List */}
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-foreground">{t.recentIssues}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        All reported issues in your community
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {issues.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">{t.noIssues}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.noIssuesDesc}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {issues.slice(0, 10).map((issue) => (
                            <div key={issue.id} className="border border-border rounded-lg p-4 bg-background">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-foreground">{issue.title}</h3>
                                    <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                                      {issue.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground text-sm mb-2">{issue.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                                      <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Badge className={getStatusColor(issue.status)}>
                                    {getStatusIcon(issue.status)}
                                    <span className="ml-1 capitalize">{issue.status.replace('-', ' ')}</span>
                                  </Badge>
                                </div>
                              </div>
                              
                              {issue.photoUrl && (
                                <img 
                                  src={issue.photoUrl} 
                                  alt="Issue photo" 
                                  className="w-full max-w-sm h-32 object-cover rounded-lg mb-3 border border-border"
                                />
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {t.category}: {issue.category}
                                </span>
                                {issue.adminNote && (
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {t.adminNote}: {issue.adminNote}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
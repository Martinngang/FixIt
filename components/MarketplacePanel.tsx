import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Button } from "./ui/button.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
import { useToast } from "./ToastContext.tsx"
import { EmptyState } from "./ui/empty-state.tsx"
import { StatusBadge } from "./ui/status-badge.tsx"
import {
  Store,
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  Clock,
  Loader2,
  ListChecks,
  Unlink,
} from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"

interface MarketplaceJob {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: 'low' | 'medium' | 'high'
  budget: number
  commissionRate: number
  contractorPayout: number
  postedAt: string
  organizationName: string
}

interface MyJob {
  id: string
  title: string
  description: string
  category: string
  location: string
  priority: string
  status: string
  marketplace: {
    status: 'claimed' | 'completed' | 'paid'
    budget: number
    commissionRate: number
    contractorId: string
    contractorName: string
    claimedAt: string
    completedAt?: string
    paidAt?: string
  }
}

const translations = {
  en: {
    marketplaceTitle: 'Marketplace',
    marketplaceSubtitle: 'Browse and claim jobs posted by cities and organizations',
    orgTenantNotice: "The contractor marketplace is reserved for independent contractors on the public city platform. As a member of an organization, keep using your organization's own technician pool.",
    contractorIntro: 'Become a vetted independent contractor (plumber, electrician, landscaper, etc.) and claim jobs from the marketplace job board.',
    applyContractor: 'Apply to become a Contractor',
    applying: 'Submitting...',
    contractorPending: 'Your contractor application is under review by the city admin team.',
    contractorRejected: 'Your contractor application was not approved.',
    applySuccess: 'Application submitted successfully',
    applyError: 'Failed to submit contractor application',
    stripeOnboardingBanner: 'Connect a Stripe account to receive payouts before you can claim jobs.',
    connectStripe: 'Connect with Stripe',
    connecting: 'Connecting...',
    stripeOnboardError: 'Failed to start Stripe onboarding',
    stripeConnected: 'Stripe account connected',
    disconnectStripe: 'Disconnect Stripe',
    disconnecting: 'Disconnecting...',
    disconnectStripeError: 'Failed to disconnect Stripe account',
    disconnectStripeSuccess: 'Stripe account disconnected',
    openJobsTab: 'Open Jobs',
    myJobsTab: 'My Jobs',
    loading: 'Loading...',
    noOpenJobs: 'No open jobs right now',
    noOpenJobsDesc: 'Check back later for new marketplace postings',
    noMyJobs: 'No claimed jobs yet',
    noMyJobsDesc: 'Jobs you claim from the Open Jobs tab will appear here',
    budget: 'Budget',
    yourPayout: 'Your payout',
    postedBy: 'Posted by',
    postedOn: 'Posted',
    claimJob: 'Claim Job',
    claiming: 'Claiming...',
    claimSuccess: 'Job claimed successfully',
    claimError: 'Failed to claim job',
    stripeRequiredHint: 'Complete Stripe onboarding to claim jobs',
    statusClaimed: 'In Progress',
    statusCompleted: 'Awaiting Payment',
    statusPaid: 'Paid',
    markResolved: 'Mark Resolved',
    markingResolved: 'Updating...',
    markResolvedSuccess: 'Job marked as resolved',
    markResolvedError: 'Failed to update job',
    earningsBreakdown: 'Earnings breakdown',
    totalBudget: 'Total budget',
    commission: 'FixIt commission',
    payout: 'Your payout',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  fr: {
    marketplaceTitle: 'Marché',
    marketplaceSubtitle: 'Parcourez et réclamez des travaux publiés par les villes et organisations',
    orgTenantNotice: "Le marché des entrepreneurs est réservé aux entrepreneurs indépendants de la plateforme municipale publique. En tant que membre d'une organisation, continuez à utiliser le pool de techniciens de votre organisation.",
    contractorIntro: 'Devenez un entrepreneur indépendant vérifié (plombier, électricien, paysagiste, etc.) et réclamez des travaux depuis le tableau des offres.',
    applyContractor: 'Postuler comme entrepreneur',
    applying: 'Envoi...',
    contractorPending: "Votre candidature est en cours d'examen par l'équipe administrative de la ville.",
    contractorRejected: "Votre candidature d'entrepreneur n'a pas été approuvée.",
    applySuccess: 'Candidature soumise avec succès',
    applyError: 'Échec de la soumission de la candidature',
    stripeOnboardingBanner: 'Connectez un compte Stripe pour recevoir vos paiements avant de pouvoir réclamer des travaux.',
    connectStripe: 'Connecter avec Stripe',
    connecting: 'Connexion...',
    stripeOnboardError: 'Échec du démarrage de la connexion Stripe',
    stripeConnected: 'Compte Stripe connecté',
    disconnectStripe: 'Déconnecter Stripe',
    disconnecting: 'Déconnexion...',
    disconnectStripeError: 'Échec de la déconnexion du compte Stripe',
    disconnectStripeSuccess: 'Compte Stripe déconnecté',
    openJobsTab: 'Offres ouvertes',
    myJobsTab: 'Mes travaux',
    loading: 'Chargement...',
    noOpenJobs: 'Aucune offre ouverte pour le moment',
    noOpenJobsDesc: 'Revenez plus tard pour de nouvelles offres',
    noMyJobs: 'Aucun travail réclamé',
    noMyJobsDesc: 'Les travaux que vous réclamez apparaîtront ici',
    budget: 'Budget',
    yourPayout: 'Votre paiement',
    postedBy: 'Publié par',
    postedOn: 'Publié le',
    claimJob: "Réclamer l'offre",
    claiming: 'Réclamation...',
    claimSuccess: 'Travail réclamé avec succès',
    claimError: 'Échec de la réclamation du travail',
    stripeRequiredHint: 'Connectez votre compte Stripe pour réclamer des travaux',
    statusClaimed: 'En cours',
    statusCompleted: 'En attente de paiement',
    statusPaid: 'Payé',
    markResolved: 'Marquer comme résolu',
    markingResolved: 'Mise à jour...',
    markResolvedSuccess: 'Travail marqué comme résolu',
    markResolvedError: 'Échec de la mise à jour du travail',
    earningsBreakdown: 'Détail des gains',
    totalBudget: 'Budget total',
    commission: 'Commission FixIt',
    payout: 'Votre paiement',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  }
}

export function MarketplacePanel({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const t = translations[language]
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any | null | undefined>(undefined)
  const [marketplaceStatus, setMarketplaceStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined)
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false)
  const [applying, setApplying] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const [jobsLoading, setJobsLoading] = useState(false)
  const [openJobs, setOpenJobs] = useState<MarketplaceJob[]>([])
  const [myJobs, setMyJobs] = useState<MyJob[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/profile`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      setMarketplaceStatus(data.user?.marketplaceStatus)
      setStripeOnboardingComplete(!!data.user?.stripeOnboardingComplete)
    } catch (err) {
      console.error('Fetch profile error:', err)
    }
  }

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      setOrganization(data.organization)
    } catch (err) {
      console.error('Fetch organization error:', err)
      setOrganization(null)
    }
  }

  const refreshStripeStatus = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/stripe/status`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      setStripeOnboardingComplete(!!data.onboardingComplete)
    } catch (err) {
      console.error('Fetch Stripe status error:', err)
    }
  }

  const fetchOpenJobs = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/jobs`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      setOpenJobs(data.jobs || [])
    } catch (err) {
      console.error('Fetch open jobs error:', err)
    }
  }

  const fetchMyJobs = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/my-jobs`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      setMyJobs(data.jobs || [])
    } catch (err) {
      console.error('Fetch my jobs error:', err)
    }
  }

  useEffect(() => {
    if (!session?.access_token) return

    ;(async () => {
      setLoading(true)
      await Promise.all([fetchProfile(), fetchOrganization()])
      setLoading(false)
    })()
  }, [session])

  useEffect(() => {
    if (marketplaceStatus !== 'approved' || !session?.access_token) return

    ;(async () => {
      setJobsLoading(true)
      await Promise.all([fetchOpenJobs(), fetchMyJobs(), refreshStripeStatus()])
      setJobsLoading(false)
    })()
  }, [marketplaceStatus, session])

  const handleApply = async () => {
    try {
      setApplying(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.applyError)

      setMarketplaceStatus(data.marketplaceStatus)
      addToast(t.applySuccess, 'success')
    } catch (err: any) {
      console.error('Apply error:', err)
      addToast(err.message || t.applyError, 'error')
    } finally {
      setApplying(false)
    }
  }

  const handleStripeOnboard = async () => {
    try {
      setOnboarding(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/stripe/onboard`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.stripeOnboardError)

      window.location.href = data.url
    } catch (err: any) {
      console.error('Stripe onboarding error:', err)
      addToast(err.message || t.stripeOnboardError, 'error')
      setOnboarding(false)
    }
  }

  const handleStripeDisconnect = async () => {
    try {
      setDisconnecting(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/stripe/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.disconnectStripeError)

      setStripeOnboardingComplete(false)
      addToast(t.disconnectStripeSuccess, 'success')
    } catch (err: any) {
      console.error('Stripe disconnect error:', err)
      addToast(err.message || t.disconnectStripeError, 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleClaim = async (jobId: string) => {
    try {
      setClaimingId(jobId)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/marketplace/jobs/${jobId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.claimError)

      addToast(t.claimSuccess, 'success')
      setOpenJobs(prev => prev.filter(job => job.id !== jobId))
      fetchMyJobs()
    } catch (err: any) {
      console.error('Claim job error:', err)
      addToast(err.message || t.claimError, 'error')
    } finally {
      setClaimingId(null)
    }
  }

  const handleMarkResolved = async (issueId: string) => {
    try {
      setResolvingId(issueId)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issueId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.markResolvedError)

      setMyJobs(prev => prev.map(job => job.id === data.issue.id ? data.issue : job))
      addToast(t.markResolvedSuccess, 'success')
    } catch (err: any) {
      console.error('Mark resolved error:', err)
      addToast(err.message || t.markResolvedError, 'error')
    } finally {
      setResolvingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
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
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-info" />
            <span>{t.marketplaceTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.marketplaceSubtitle}
          </CardDescription>
        </CardHeader>
      </Card>

      {organization !== null ? (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>{t.orgTenantNotice}</AlertDescription>
        </Alert>
      ) : !marketplaceStatus ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-muted-foreground text-sm">{t.contractorIntro}</p>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
              {applying ? t.applying : t.applyContractor}
            </Button>
          </CardContent>
        </Card>
      ) : marketplaceStatus === 'pending' ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>{t.contractorPending}</AlertDescription>
        </Alert>
      ) : marketplaceStatus === 'rejected' ? (
        <Alert variant="destructive">
          <AlertDescription>{t.contractorRejected}</AlertDescription>
        </Alert>
      ) : (
        <>
          {!stripeOnboardingComplete ? (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <span>{t.stripeOnboardingBanner}</span>
                <Button size="sm" onClick={handleStripeOnboard} disabled={onboarding} className="self-start sm:self-auto">
                  {onboarding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {onboarding ? t.connecting : t.connectStripe}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <span>{t.stripeConnected}</span>
                <Button size="sm" variant="outline" onClick={handleStripeDisconnect} disabled={disconnecting} className="self-start sm:self-auto">
                  {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                  {disconnecting ? t.disconnecting : t.disconnectStripe}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="open-jobs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
              <TabsTrigger value="open-jobs" className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>{t.openJobsTab}</span>
              </TabsTrigger>
              <TabsTrigger value="my-jobs" className="gap-1.5">
                <ListChecks className="h-4 w-4" />
                <span>{t.myJobsTab}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open-jobs" className="space-y-4">
              {jobsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ) : openJobs.length === 0 ? (
                <Card>
                  <CardContent>
                    <EmptyState icon={Briefcase} title={t.noOpenJobs} description={t.noOpenJobsDesc} />
                  </CardContent>
                </Card>
              ) : (
                openJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <StatusBadge kind="priority" value={job.priority} label={t[job.priority as keyof typeof t] || job.priority} />
                            <Badge variant="outline">{job.category}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{t.postedBy}: {job.organizationName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{t.postedOn} {new Date(job.postedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground">{t.budget}: <span className="font-semibold text-foreground">${job.budget.toFixed(2)}</span></span>
                            <span className="text-muted-foreground">{t.yourPayout}: <span className="font-semibold text-success">${job.contractorPayout.toFixed(2)}</span></span>
                          </div>
                        </div>
                        <div className="flex flex-col items-stretch sm:items-end gap-2 sm:shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleClaim(job.id)}
                            disabled={!stripeOnboardingComplete || claimingId === job.id}
                          >
                            {claimingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
                            <span>{claimingId === job.id ? t.claiming : t.claimJob}</span>
                          </Button>
                          {!stripeOnboardingComplete && (
                            <p className="text-xs text-muted-foreground text-center sm:text-right sm:max-w-[160px]">{t.stripeRequiredHint}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="my-jobs" className="space-y-4">
              {jobsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ) : myJobs.length === 0 ? (
                <Card>
                  <CardContent>
                    <EmptyState icon={ListChecks} title={t.noMyJobs} description={t.noMyJobsDesc} />
                  </CardContent>
                </Card>
              ) : (
                myJobs.map((job) => {
                  const commissionAmount = Math.round(job.marketplace.budget * job.marketplace.commissionRate * 100) / 100
                  const payout = Math.round((job.marketplace.budget - commissionAmount) * 100) / 100

                  return (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{job.title}</h3>
                              <StatusBadge
                                kind="marketplace"
                                value={job.marketplace.status}
                                label={
                                  job.marketplace.status === 'claimed' ? t.statusClaimed :
                                  job.marketplace.status === 'completed' ? t.statusCompleted :
                                  job.marketplace.status === 'paid' ? t.statusPaid :
                                  job.marketplace.status
                                }
                              />
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{job.description}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>

                            {job.marketplace.status === 'paid' ? (
                              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1 text-sm">
                                <div className="font-medium text-foreground mb-1">{t.earningsBreakdown}</div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>{t.totalBudget}</span>
                                  <span>${job.marketplace.budget.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>{t.commission}</span>
                                  <span>-${commissionAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-success">
                                  <span>{t.payout}</span>
                                  <span>${payout.toFixed(2)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-muted-foreground">{t.budget}: <span className="font-semibold text-foreground">${job.marketplace.budget.toFixed(2)}</span></span>
                                <span className="text-muted-foreground">{t.yourPayout}: <span className="font-semibold text-success">${payout.toFixed(2)}</span></span>
                              </div>
                            )}
                          </div>

                          {job.marketplace.status === 'claimed' && (
                            <div className="sm:shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleMarkResolved(job.id)}
                                disabled={resolvingId === job.id}
                                className="w-full sm:w-auto"
                              >
                                {resolvingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                <span>{resolvingId === job.id ? t.markingResolved : t.markResolved}</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

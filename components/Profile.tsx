import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Badge } from "./ui/badge.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Skeleton } from "./ui/skeleton.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
import { User, Mail, Phone, MapPin, Save, Edit, X, Camera, Upload, Award, Building2, RefreshCw, Briefcase, CreditCard, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase/client.ts'
import { User as UserType } from '../src/types/user.ts'

interface Organization {
  id: string
  name: string
  type: string
  categories?: string[]
  locationLabel?: string
  joinCode?: string
}

interface ProfileProps {
  session: any;
  language?: 'en' | 'fr';
}

const translations = {
  en: {
    profile: 'Profile',
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    accountInfo: 'Account Information',
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    role: 'Role',
    categories: 'Categories',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    updateSuccess: 'Profile updated successfully',
    updateError: 'Failed to update profile',
    citizen: 'Citizen',
    technician: 'Technician',
    admin: 'Administrator',
    orgAdminRole: 'Organisation Admin',
    contractorRole: 'Contractor',
    reputation: 'Reputation & Badges',
    reputationSubtitle: 'Earn points and badges by reporting issues and helping your community',
    points: 'points',
    badgeNewcomer: 'Newcomer',
    badgeActiveCitizen: 'Active Citizen',
    badgeCivicContributor: 'Civic Contributor',
    badgeCommunityChampion: 'Community Champion',
    issuesReported: 'Issues Reported',
    issuesResolved: 'Issues Resolved',
    upvotesReceived: 'Upvotes Received',
    pointsToNextBadge: 'points to',
    organization: 'Organization',
    organizationSubtitle: 'Manage your organization membership',
    publicCityNotice: "You're part of the public city platform.",
    orgName: 'Name',
    orgType: 'Type',
    orgTypeUniversity: 'University Campus',
    orgTypeCorporate: 'Corporate Park',
    orgTypeResidential: 'Residential Community',
    orgTypeMall: 'Shopping Mall',
    orgTypeOther: 'Other',
    createOrgTitle: 'Register your organization',
    orgNamePlaceholder: 'Organization name',
    createOrg: 'Create Organization',
    joinOrgTitle: 'Join an organization',
    joinCodePlaceholder: 'Enter join code',
    joinOrg: 'Join',
    joinCode: 'Join Code',
    regenerateCode: 'Regenerate',
    joinCodeHint: 'Share this code with your team so they can join your organization.',
    orgAdminHint: "You're an organization admin. Manage categories, location labels, and your join code from the Organization tab in the Admin Panel.",
    orgCreated: 'Organization created successfully',
    orgJoined: 'Joined organization successfully',
    orgCreateError: 'Failed to create organization',
    orgJoinError: 'Failed to join organization',
    orgRegenerateError: 'Failed to regenerate join code',
    contractorTitle: 'Independent Contractor',
    contractorSubtitle: 'Join the FixIt marketplace and get paid for completing jobs posted by cities and organizations',
    contractorIntro: 'Become a vetted independent contractor (plumber, electrician, landscaper, etc.) and claim jobs from the marketplace job board.',
    applyContractor: 'Apply to become a Contractor',
    contractorPending: 'Your contractor application is under review by the city admin team.',
    contractorRejected: 'Your contractor application was not approved.',
    contractorApproved: "You're an approved contractor. Connect a Stripe account to receive payouts for completed jobs.",
    connectStripe: 'Connect with Stripe',
    payoutsEnabled: 'Stripe payouts are enabled. You can now claim jobs from the marketplace.',
    goToMarketplace: 'Go to Marketplace',
    contractorApplySuccess: 'Application submitted successfully',
    contractorApplyError: 'Failed to submit contractor application',
    stripeOnboardError: 'Failed to start Stripe onboarding',
  },
  fr: {
    profile: 'Profil',
    personalInfo: 'Informations personnelles',
    contactInfo: 'Informations de contact',
    accountInfo: 'Informations du compte',
    name: 'Nom complet',
    email: 'Adresse e-mail',
    phone: 'Numéro de téléphone',
    address: 'Adresse',
    role: 'Rôle',
    categories: 'Catégories',
    editProfile: 'Modifier le profil',
    saveChanges: 'Enregistrer les modifications',
    cancel: 'Annuler',
    loading: 'Chargement...',
    updateSuccess: 'Profil mis à jour avec succès',
    updateError: 'Échec de la mise à jour du profil',
    citizen: 'Citoyen',
    technician: 'Technicien',
    admin: 'Administrateur',
    orgAdminRole: "Administrateur d'organisation",
    contractorRole: 'Entrepreneur',
    reputation: 'Réputation et badges',
    reputationSubtitle: 'Gagnez des points et des badges en signalant des problèmes et en aidant votre communauté',
    points: 'points',
    badgeNewcomer: 'Nouveau venu',
    badgeActiveCitizen: 'Citoyen actif',
    badgeCivicContributor: 'Contributeur civique',
    badgeCommunityChampion: 'Champion communautaire',
    issuesReported: 'Problèmes signalés',
    issuesResolved: 'Problèmes résolus',
    upvotesReceived: 'Votes reçus',
    pointsToNextBadge: 'points avant',
    organization: 'Organisation',
    organizationSubtitle: 'Gérez votre appartenance à une organisation',
    publicCityNotice: 'Vous faites partie de la plateforme municipale publique.',
    orgName: 'Nom',
    orgType: 'Type',
    orgTypeUniversity: 'Campus universitaire',
    orgTypeCorporate: 'Parc d\'entreprises',
    orgTypeResidential: 'Communauté résidentielle',
    orgTypeMall: 'Centre commercial',
    orgTypeOther: 'Autre',
    createOrgTitle: 'Enregistrez votre organisation',
    orgNamePlaceholder: 'Nom de l\'organisation',
    createOrg: 'Créer l\'organisation',
    joinOrgTitle: 'Rejoindre une organisation',
    joinCodePlaceholder: 'Entrez le code d\'invitation',
    joinOrg: 'Rejoindre',
    joinCode: 'Code d\'invitation',
    regenerateCode: 'Régénérer',
    joinCodeHint: 'Partagez ce code avec votre équipe pour qu\'elle rejoigne votre organisation.',
    orgAdminHint: 'Vous êtes administrateur de l\'organisation. Gérez les catégories, les libellés de localisation et le code d\'invitation depuis l\'onglet Organisation du panneau d\'administration.',
    orgCreated: 'Organisation créée avec succès',
    orgJoined: 'Organisation rejointe avec succès',
    orgCreateError: 'Échec de la création de l\'organisation',
    orgJoinError: 'Échec de l\'adhésion à l\'organisation',
    orgRegenerateError: 'Échec de la régénération du code',
    contractorTitle: 'Entrepreneur indépendant',
    contractorSubtitle: 'Rejoignez le marché FixIt et soyez payé pour les travaux publiés par les villes et organisations',
    contractorIntro: 'Devenez un entrepreneur indépendant vérifié (plombier, électricien, paysagiste, etc.) et réclamez des travaux depuis le tableau des offres.',
    applyContractor: 'Postuler comme entrepreneur',
    contractorPending: 'Votre candidature est en cours d\'examen par l\'équipe administrative de la ville.',
    contractorRejected: 'Votre candidature d\'entrepreneur n\'a pas été approuvée.',
    contractorApproved: 'Vous êtes un entrepreneur approuvé. Connectez un compte Stripe pour recevoir vos paiements pour les travaux terminés.',
    connectStripe: 'Connecter avec Stripe',
    payoutsEnabled: 'Les paiements Stripe sont activés. Vous pouvez maintenant réclamer des travaux sur le marché.',
    goToMarketplace: 'Aller au marché',
    contractorApplySuccess: 'Candidature soumise avec succès',
    contractorApplyError: 'Échec de la soumission de la candidature',
    stripeOnboardError: 'Échec du démarrage de la connexion Stripe',
  }
}

export function Profile({ session, language = 'en' }: ProfileProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgType, setNewOrgType] = useState('other')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [creatingOrg, setCreatingOrg] = useState(false)
  const [joiningOrg, setJoiningOrg] = useState(false)
  const [regeneratingCode, setRegeneratingCode] = useState(false)
  const [applyingContractor, setApplyingContractor] = useState(false)
  const [onboardingStripe, setOnboardingStripe] = useState(false)

  const t = translations[language]

  useEffect(() => {
    fetchProfile()
    fetchOrganization()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || '',
        phone: data.user.phone || '',
        address: data.user.address || ''
      })
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/organizations/me`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch organization')

      const data = await response.json()
      setOrganization(data.organization)
    } catch (err: any) {
      console.error('Organization fetch error:', err)
      setOrganization(null)
    }
  }

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return

    try {
      setCreatingOrg(true)
      setError('')
      setSuccess('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newOrgName.trim(), type: newOrgType })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.orgCreateError)

      setOrganization(data.organization)
      setNewOrgName('')
      await supabase.auth.refreshSession()
      setSuccess(t.orgCreated)
    } catch (err: any) {
      console.error('Create organization error:', err)
      setError(err.message || t.orgCreateError)
    } finally {
      setCreatingOrg(false)
    }
  }

  const handleJoinOrg = async () => {
    if (!joinCodeInput.trim()) return

    try {
      setJoiningOrg(true)
      setError('')
      setSuccess('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/organizations/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ joinCode: joinCodeInput.trim() })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.orgJoinError)

      setOrganization(data.organization)
      setJoinCodeInput('')
      await supabase.auth.refreshSession()
      setSuccess(t.orgJoined)
    } catch (err: any) {
      console.error('Join organization error:', err)
      setError(err.message || t.orgJoinError)
    } finally {
      setJoiningOrg(false)
    }
  }

  const handleRegenerateCode = async () => {
    try {
      setRegeneratingCode(true)
      setError('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/organizations/me/regenerate-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.orgRegenerateError)

      setOrganization(prev => prev ? { ...prev, joinCode: data.joinCode } : prev)
    } catch (err: any) {
      console.error('Regenerate join code error:', err)
      setError(err.message || t.orgRegenerateError)
    } finally {
      setRegeneratingCode(false)
    }
  }

  const handleApplyContractor = async () => {
    try {
      setApplyingContractor(true)
      setError('')
      setSuccess('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/marketplace/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.contractorApplyError)

      setUser(prev => prev ? { ...prev, marketplaceStatus: data.marketplaceStatus } : prev)
      setSuccess(t.contractorApplySuccess)
    } catch (err: any) {
      console.error('Contractor application error:', err)
      setError(err.message || t.contractorApplyError)
    } finally {
      setApplyingContractor(false)
    }
  }

  const handleStripeOnboard = async () => {
    try {
      setOnboardingStripe(true)
      setError('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/marketplace/stripe/onboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.stripeOnboardError)

      window.location.href = data.url
    } catch (err: any) {
      console.error('Stripe onboarding error:', err)
      setError(err.message || t.stripeOnboardError)
      setOnboardingStripe(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setUser(data.user)
      setSuccess(t.updateSuccess)
      setEditing(false)
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || t.updateError)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    })
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      setError('')

      const formDataUpload = new FormData()
      formDataUpload.append('avatar', file)

      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-accecacf/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formDataUpload
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()

      // Update local user state
      setUser(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null)
      setSuccess('Profile picture updated successfully')
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      setError(err.message || 'Failed to upload profile picture')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    if (role === 'admin' && user?.organizationId) return t.orgAdminRole
    if (role === 'technician' && user?.marketplaceStatus === 'approved') return t.contractorRole
    switch (role) {
      case 'citizen': return t.citizen
      case 'technician': return t.technician
      case 'admin': return t.admin
      default: return role
    }
  }

  const getBadgeDisplay = (badge: string) => {
    switch (badge) {
      case 'newcomer': return t.badgeNewcomer
      case 'active_citizen': return t.badgeActiveCitizen
      case 'civic_contributor': return t.badgeCivicContributor
      case 'community_champion': return t.badgeCommunityChampion
      default: return badge
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t.profile}</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="self-start sm:self-auto">
            <Edit className="h-4 w-4" />
            <span>{t.editProfile}</span>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <span>Profile Picture</span>
          </CardTitle>
          <CardDescription>Upload a profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-gradient-brand text-white rounded-full p-2 cursor-pointer shadow-glow hover:scale-110 transition-transform">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Change Profile Picture</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a new profile picture. JPG, PNG or GIF (max 5MB)
              </p>
              {uploadingAvatar && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation & Badges */}
      {user?.reputation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              <span>{t.reputation}</span>
            </CardTitle>
            <CardDescription>{t.reputationSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="text-base px-3 py-1">
                {getBadgeDisplay(user.reputation.badge)}
              </Badge>
              <span className="text-2xl font-display font-bold text-foreground">{user.reputation.points}</span>
              <span className="text-muted-foreground">{t.points}</span>
            </div>

            {user.reputation.nextBadge && (
              <p className="text-sm text-muted-foreground">
                {user.reputation.nextBadge.pointsNeeded} {t.pointsToNextBadge} {getBadgeDisplay(user.reputation.nextBadge.key)}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="text-xl font-display font-semibold text-foreground">{user.reputation.breakdown.reported}</div>
                <div className="text-xs text-muted-foreground">{t.issuesReported}</div>
              </div>
              <div className="text-center rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="text-xl font-display font-semibold text-foreground">{user.reputation.breakdown.resolved}</div>
                <div className="text-xs text-muted-foreground">{t.issuesResolved}</div>
              </div>
              <div className="text-center rounded-xl border border-border/50 bg-muted/30 p-3">
                <div className="text-xl font-display font-semibold text-foreground">{user.reputation.breakdown.upvotesReceived}</div>
                <div className="text-xs text-muted-foreground">{t.upvotesReceived}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{t.organization}</span>
          </CardTitle>
          <CardDescription>{t.organizationSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organization === undefined ? (
            <p className="text-muted-foreground">{t.loading}</p>
          ) : organization ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.orgName}</Label>
                  <p className="text-foreground">{organization.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t.orgType}</Label>
                  <Badge variant="outline" className="w-fit">
                    {t[`orgType${organization.type.charAt(0).toUpperCase()}${organization.type.slice(1)}` as keyof typeof t] || organization.type}
                  </Badge>
                </div>
              </div>

              {organization.joinCode && (
                <div className="space-y-2 border-t border-border pt-4">
                  <Label>{t.joinCode}</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="px-3 py-1.5 bg-muted rounded-xl text-sm font-mono">{organization.joinCode}</code>
                    <Button size="sm" variant="outline" onClick={handleRegenerateCode} disabled={regeneratingCode}>
                      <RefreshCw className={`h-4 w-4 ${regeneratingCode ? 'animate-spin' : ''}`} />
                      {t.regenerateCode}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.joinCodeHint}</p>
                  <Alert>
                    <AlertDescription>{t.orgAdminHint}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t.publicCityNotice}</p>

              <Tabs defaultValue="create">
                <TabsList className="w-full">
                  <TabsTrigger value="create" className="flex-1">{t.createOrgTitle}</TabsTrigger>
                  <TabsTrigger value="join" className="flex-1">{t.joinOrgTitle}</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="space-y-3 pt-4">
                  <Input
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder={t.orgNamePlaceholder}
                  />
                  <Select value={newOrgType} onValueChange={setNewOrgType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">{t.orgTypeUniversity}</SelectItem>
                      <SelectItem value="corporate">{t.orgTypeCorporate}</SelectItem>
                      <SelectItem value="residential">{t.orgTypeResidential}</SelectItem>
                      <SelectItem value="mall">{t.orgTypeMall}</SelectItem>
                      <SelectItem value="other">{t.orgTypeOther}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateOrg} disabled={creatingOrg || !newOrgName.trim()}>
                    <Building2 className="h-4 w-4" />
                    {creatingOrg ? t.loading : t.createOrg}
                  </Button>
                </TabsContent>
                <TabsContent value="join" className="space-y-3 pt-4">
                  <Input
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder={t.joinCodePlaceholder}
                  />
                  <Button onClick={handleJoinOrg} disabled={joiningOrg || !joinCodeInput.trim()} variant="outline">
                    {joiningOrg ? t.loading : t.joinOrg}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Independent Contractor (marketplace) */}
      {organization === null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span>{t.contractorTitle}</span>
            </CardTitle>
            <CardDescription>{t.contractorSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user?.marketplaceStatus && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t.contractorIntro}</p>
                <Button onClick={handleApplyContractor} disabled={applyingContractor}>
                  <Briefcase className="h-4 w-4" />
                  {applyingContractor ? t.loading : t.applyContractor}
                </Button>
              </div>
            )}

            {user?.marketplaceStatus === 'pending' && (
              <Alert>
                <AlertDescription>{t.contractorPending}</AlertDescription>
              </Alert>
            )}

            {user?.marketplaceStatus === 'rejected' && (
              <Alert variant="destructive">
                <AlertDescription>{t.contractorRejected}</AlertDescription>
              </Alert>
            )}

            {user?.marketplaceStatus === 'approved' && (
              user.stripeOnboardingComplete ? (
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>{t.payoutsEnabled}</AlertDescription>
                  </Alert>
                  <Button asChild>
                    <Link to="/marketplace">
                      {t.goToMarketplace}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>{t.contractorApproved}</AlertDescription>
                  </Alert>
                  <Button onClick={handleStripeOnboard} disabled={onboardingStripe}>
                    <CreditCard className="h-4 w-4" />
                    {onboardingStripe ? t.loading : t.connectStripe}
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{t.personalInfo}</span>
          </CardTitle>
          <CardDescription>Your personal details, contact info, and account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-foreground">{user?.name || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              {editing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-foreground">{user?.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.address}</Label>
            {editing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                rows={3}
              />
            ) : (
              <p className="text-foreground">{user?.address || 'Not provided'}</p>
            )}
          </div>

          <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.role}</Label>
              <Badge variant="outline" className="w-fit">
                {getRoleDisplay(user?.role || 'citizen')}
              </Badge>
            </div>

            {user?.categories && user.categories.length > 0 && (
              <div className="space-y-2">
                <Label>{t.categories}</Label>
                <div className="flex flex-wrap gap-2">
                  {user.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user?.created_at && (
              <div className="space-y-2">
                <Label>Member since</Label>
                <p className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editing && (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4" />
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? t.loading : t.saveChanges}
          </Button>
        </div>
      )}
    </div>
  )
}
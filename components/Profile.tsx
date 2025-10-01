import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Badge } from "./ui/badge.tsx"
import { User, Mail, Phone, MapPin, Save, Edit, X, Camera, Upload } from 'lucide-react'
import { supabase } from '../utils/supabase/client.ts'
import { User as UserType } from '../src/types/user.ts'

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
    admin: 'Administrator'
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
    admin: 'Administrateur'
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

  const t = translations[language]

  useEffect(() => {
    fetchProfile()
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
    switch (role) {
      case 'citizen': return t.citizen
      case 'technician': return t.technician
      case 'admin': return t.admin
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.profile}</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="flex items-center space-x-2">
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
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Profile Picture</span>
          </CardTitle>
          <CardDescription>Upload a profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
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
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
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
                <div className="flex items-center space-x-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t.personalInfo}</span>
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>{t.contactInfo}</span>
            </CardTitle>
            <CardDescription>Your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-foreground">{user?.email}</p>
              </div>
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
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t.accountInfo}</span>
            </CardTitle>
            <CardDescription>Your account details and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {user?.created_at && (
              <div className="space-y-2">
                <Label>Member since</Label>
                <p className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editing && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? t.loading : t.saveChanges}
          </Button>
        </div>
      )}
    </div>
  )
}
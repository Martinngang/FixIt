import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Camera, MapPin, AlertCircle, CheckCircle, Upload, Loader2, Trash2, Locate, Sun, Moon } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

const categories = [
  { en: 'Road & Transportation', fr: 'Routes et Transport' },
  { en: 'Water & Utilities', fr: 'Eau et Services publics' },
  { en: 'Parks & Recreation', fr: 'Parcs et Loisirs' },
  { en: 'Public Safety', fr: 'Sécurité publique' },
  { en: 'Waste Management', fr: 'Gestion des déchets' },
  { en: 'Street Lighting', fr: 'Éclairage public' },
  { en: 'Public Buildings', fr: 'Bâtiments publics' },
  { en: 'Environmental', fr: 'Environnement' },
  { en: 'Other', fr: 'Autre' }
]

const priorities = [
  { 
    value: 'low', 
    en: { label: 'Low', description: 'Non-urgent, can wait' },
    fr: { label: 'Faible', description: 'Non urgent, peut attendre' }
  },
  { 
    value: 'medium', 
    en: { label: 'Medium', description: 'Should be addressed soon' },
    fr: { label: 'Moyen', description: 'À traiter bientôt' }
  },
  { 
    value: 'high', 
    en: { label: 'High', description: 'Urgent, needs immediate attention' },
    fr: { label: 'Élevé', description: 'Urgent, nécessite une attention immédiate' }
  }
]

const translations = {
  en: {
    title: 'Report a New Issue',
    subtitle: 'Help improve your community by reporting local issues that need attention',
    issueTitle: 'Issue Title',
    issueTitlePlaceholder: 'e.g., Pothole on Main Street',
    description: 'Description',
    descriptionPlaceholder: 'Provide a detailed description of the issue...',
    category: 'Category',
    categoryPlaceholder: 'Select a category',
    priority: 'Priority',
    location: 'Location',
    locationPlaceholder: 'e.g., 123 Main Street, or intersection of Oak & Pine',
    locationNote: 'Be as specific as possible to help locate the issue',
    photo: 'Photo (Optional)',
    photoNote: 'Adding a photo helps authorities understand the issue better',
    takePhoto: 'Take Photo',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove Photo',
    getCurrentLocation: 'Get Current Location',
    gettingLocation: 'Getting location...',
    requiredFields: '* Required fields',
    submitButton: 'Submit Issue Report',
    submitting: 'Submitting...',
    successMessage: 'Your issue has been reported successfully! You can track its progress in the "My Issues" tab.',
    photoUploadError: 'Failed to upload photo. Please try again.',
    locationError: 'Unable to get your location. Please enter it manually.',
    locationSuccess: 'Location updated successfully!',
    toggleTheme: 'Toggle theme'
  },
  fr: {
    title: 'Signaler un nouveau problème',
    subtitle: 'Aidez à améliorer votre communauté en signalant des problèmes locaux qui nécessitent une attention',
    issueTitle: 'Titre du problème',
    issueTitlePlaceholder: 'ex. Nid-de-poule sur la rue Main',
    description: 'Description',
    descriptionPlaceholder: 'Fournissez une description détaillée du problème...',
    category: 'Catégorie',
    categoryPlaceholder: 'Sélectionner une catégorie',
    priority: 'Priorité',
    location: 'Emplacement',
    locationPlaceholder: 'ex. 123 rue Main, ou intersection Oak & Pine',
    locationNote: 'Soyez aussi précis que possible pour aider à localiser le problème',
    photo: 'Photo (Optionnel)',
    photoNote: 'Ajouter une photo aide les autorités à mieux comprendre le problème',
    takePhoto: 'Prendre une photo',
    uploadPhoto: 'Télécharger une photo',
    removePhoto: 'Supprimer la photo',
    getCurrentLocation: 'Obtenir la position actuelle',
    gettingLocation: 'Obtention de la position...',
    requiredFields: '* Champs obligatoires',
    submitButton: 'Soumettre le rapport',
    submitting: 'Soumission...',
    successMessage: 'Votre problème a été signalé avec succès! Vous pouvez suivre son progrès dans l\'onglet "Mes problèmes".',
    photoUploadError: 'Échec du téléchargement de la photo. Veuillez réessayer.',
    locationError: 'Impossible d\'obtenir votre position. Veuillez la saisir manuellement.',
    locationSuccess: 'Emplacement mis à jour avec succès!',
    toggleTheme: 'Basculer le thème'
  }
}

export function ReportIssue({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'medium',
    coordinates: { lat: null, lng: null } as { lat: number | null; lng: number | null }
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]

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

  const handlePhotoSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoSelect(file)
    }
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t.locationError)
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude }
        }))

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&limit=1`
          )
          const data = await response.json()
          if (data.results && data.results[0]) {
            setFormData(prev => ({
              ...prev,
              location: data.results[0].formatted
            }))
          } else {
            setFormData(prev => ({
              ...prev,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }))
          }
          setError('')
          // Show success message briefly
          const tempSuccess = success
          setSuccess(true)
          setTimeout(() => setSuccess(tempSuccess), 2000)
        } catch (err) {
          // Fallback to coordinates if geocoding fails
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }))
        }
        setLocationLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
          details: error
        })
        setError(t.locationError)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!session?.access_token) {
        throw new Error('No valid session')
      }

      // First, create the issue
      const issueData = {
        ...formData,
        category: categories.find(cat => cat.en === formData.category)?.en || formData.category
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(issueData)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `API error: ${response.status} ${response.statusText}`)
      }

      const issueResult = await response.json()

      // If there's a photo, upload it
      if (photo) {
        setPhotoUploading(true)
        try {
          const photoFormData = new FormData()
          photoFormData.append('photo', photo)

          const photoResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${issueResult.issue.id}/photo`,
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session.access_token}` },
              body: photoFormData
            }
          )

          if (!photoResponse.ok) {
            console.error('Photo upload failed, but issue was created')
            setError(t.photoUploadError)
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError)
          setError(t.photoUploadError)
        } finally {
          setPhotoUploading(false)
        }
      }

      setSuccess(true)
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        priority: 'medium',
        coordinates: { lat: null, lng: null }
      })
      removePhoto()
    } catch (err: any) {
      console.error('Report issue error:', err)
      setError(err.message || 'Failed to submit issue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-background">
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
          --red-50: #FEF2F2;
          --red-100: #FEE2E2;
          --red-200: #FECACA;
          --red-800: #991B1B;
          --red-900: #7F1D1D;
          --gray-100: #F3F4F6;
          --gray-200: #E5E7EB;
          --gray-400: #9CA3AF;
          --gray-500: #6B7280;
          --gray-600: #4B5563;
          --gray-700: #374151;
          --gray-800: #1F2A44;
          --gray-900: #111827;
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
          --red-50: #7F1D1D;
          --red-100: #FEE2E2;
          --red-200: #FECACA;
          --red-800: #991B1B;
          --red-900: #7F1D1D;
          --gray-100: #1F2A44;
          --gray-200: #2D3748;
          --gray-400: #6B7280;
          --gray-500: #9CA3AF;
          --gray-600: #D1D5DB;
          --gray-700: #E5E7EB;
          --gray-800: #D1D5DB;
          --gray-900: #F3F4F6;
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
        .bg-green-100 { background-color: var(--green-100); }
        .text-green-800 { color: var(--green-800); }
        .bg-red-50 { background-color: var(--red-50); }
        .text-red-800 { color: var(--red-800); }
        .text-gray-600 { color: var(--gray-600); }
        .text-gray-700 { color: var(--gray-700); }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
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
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .h-5 { height: 1.25rem; }
        .w-5 { width: 1.25rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .max-w-sm { max-width: 24rem; }
        .max-w-2xl { max-width: 42rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-medium { font-weight: 500; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .p-4 { padding: 1rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .pt-4 { padding-top: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .border { border-width: 1px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .w-full { width: 100%; }
        .flex { display: flex; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .flex-1 { flex: 1 1 0%; }
        .shrink-0 { flex-shrink: 0; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .top-2 { top: 0.5rem; }
        .right-2 { right: 0.5rem; }
        .transition-all { transition: all 0.3s ease; }
        .hover\\:bg-muted:hover { background-color: var(--muted); }
        .hover\\:bg-primary\\/90:hover { background-color: rgba(59, 130, 246, 0.9); }
        .hidden { display: none; }
        @keyframes location-pulse {
          0% { 
            background: var(--border);
            border-color: var(--border);
            color: var(--foreground);
          }
          25% { 
            background: linear-gradient(45deg, var(--primary), var(--green-600));
            border-color: var(--primary);
            color: var(--destructive-foreground);
          }
          50% { 
            background: linear-gradient(45deg, var(--green-600), var(--yellow-600));
            border-color: var(--green-600);
            color: var(--destructive-foreground);
          }
          75% { 
            background: linear-gradient(45deg, var(--yellow-600), var(--destructive));
            border-color: var(--yellow-600);
            color: var(--destructive-foreground);
          }
          100% { 
            background: var(--border);
            border-color: var(--border);
            color: var(--foreground);
          }
        }
        .location-button {
          animation: location-pulse 3s ease-in-out infinite;
          transition: all 0.3s ease;
        }
        .location-button:hover {
          animation-play-state: paused;
          background: linear-gradient(45deg, var(--primary), var(--green-600)) !important;
          border-color: var(--primary) !important;
          color: var(--destructive-foreground) !important;
          transform: scale(1.05);
        }
        .location-button:disabled {
          animation: none;
          background: var(--muted) !important;
          border-color: var(--border) !important;
          color: var(--muted-foreground) !important;
        }
      `}</style>
      
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

      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-foreground">{t.title}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t.successMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">{t.issueTitle} *</Label>
              <Input
                id="title"
                placeholder={t.issueTitlePlaceholder}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">{t.description} *</Label>
              <Textarea
                id="description"
                placeholder={t.descriptionPlaceholder}
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">{t.category} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder={t.categoryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((category) => (
                      <SelectItem key={category.en} value={category.en} className="text-foreground">
                        {language === 'fr' ? category.fr : category.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-foreground">{t.priority}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value} className="text-foreground">
                        <div>
                          <div className="font-medium">
                            {language === 'fr' ? priority.fr.label : priority.en.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === 'fr' ? priority.fr.description : priority.en.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">{t.location} *</Label>
              <div className="flex space-x-2">
                <Input
                  id="location"
                  placeholder={t.locationPlaceholder}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  className="flex-1 bg-background border-border text-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="shrink-0 location-button"
                  title={t.getCurrentLocation}
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.locationNote}
              </p>
              {formData.coordinates.lat && formData.coordinates.lng && (
                <Badge variant="outline" className="text-xs text-foreground">
                  GPS: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{t.photo}</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t.photoNote}
              </p>
              
              {!photoPreview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTakePhoto}
                    className="flex items-center justify-center space-x-2 h-12 bg-background border-border text-foreground hover:bg-muted"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{t.takePhoto}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadPhoto}
                    className="flex items-center justify-center space-x-2 h-12 bg-background border-border text-foreground hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{t.uploadPhoto}</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Issue photo preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTakePhoto}
                      className="flex items-center justify-center space-x-2 bg-background border-border text-foreground hover:bg-muted"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{t.takePhoto}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUploadPhoto}
                      className="flex items-center justify-center space-x-2 bg-background border-border text-foreground hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{t.uploadPhoto}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t.requiredFields}
              </p>
              
              <Button 
                type="submit" 
                disabled={loading || photoUploading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {loading || photoUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {photoUploading ? 'Uploading photo...' : t.submitting}
                  </>
                ) : (
                  t.submitButton
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
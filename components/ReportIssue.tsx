import { useState, useRef, useCallback } from 'react'
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { useToast } from "./ToastContext.tsx";
import { Badge } from "./ui/badge.tsx"
import { Camera, MapPin, AlertCircle, CheckCircle, Upload, Loader2, Trash2, Locate } from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"

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
    locationSuccess: 'Location updated successfully!'
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
    locationSuccess: 'Emplacement mis à jour avec succès!'
  }
}

export function ReportIssue({ session, language = 'en' }: { session: any; language?: 'en' | 'fr' }) {
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]
  const { addToast } = useToast();

  const handleError = useCallback((message: string) => {
    addToast(message, 'error');
    console.error(message);
  }, [addToast]);

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
      handleError(t.locationError)
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
          addToast(t.locationSuccess, 'success');
        } catch (err) {
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
        handleError(t.locationError)
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

    try {
      if (!session?.access_token) {
        throw new Error('No valid session')
      }

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
            handleError(t.photoUploadError)
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError)
          handleError(t.photoUploadError)
        } finally {
          setPhotoUploading(false)
        }
      }
      
      addToast(t.successMessage, 'success');
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
      handleError(err.message || 'Failed to submit issue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>{t.title}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
                        {categories.map((category) => (
                          <SelectItem key={category.en} value={category.en}>
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
                      <SelectContent className="bg-card shadow-lg z-50 rounded-lg">
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
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
                      className="shrink-0 location-button bg-background border-border text-foreground hover:bg-muted"
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
                    <Badge variant="outline" className="text-xs text-foreground border-border">
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
                    className="bg-primary text-destructive-foreground hover:bg-primary/90"
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
      </div>
    </>
  )
}
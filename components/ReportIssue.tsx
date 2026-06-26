import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { useToast } from "./ToastContext.tsx";
import { Badge } from "./ui/badge.tsx"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible.tsx"
import { cn } from "./ui/utils.ts"
import { Camera, MapPin, AlertCircle, CheckCircle, Upload, Loader2, Trash2, Locate, Scan, Mic, MicOff, Volume2, Sparkles, WifiOff, CloudUpload, RefreshCw, Clock, ChevronDown } from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"
import { ARCamera } from "./ARCamera.tsx"
import { savePendingReport, getAllPendingReports, deletePendingReport, syncPendingReports, type PendingReport } from "../utils/offlineReports.ts"

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

interface OrganizationInfo {
  categories?: string[]
  locationLabel?: string
}

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
    arCamera: 'AR Camera',
    arCaptureSuccess: 'Photo captured with precise AR location!',
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
    voiceReportTitle: 'Voice Report',
    voiceReportDesc: 'Describe the issue and where it is out loud, then let AI fill in the form for you.',
    startListening: 'Start Speaking',
    stopListening: 'Stop Listening',
    listening: 'Listening...',
    preparingToListen: 'Getting ready to listen...',
    voiceListenPrompt: 'Listening, go on.',
    voiceTranscriptPlaceholder: 'Your speech will appear here...',
    voiceMicSilent: "We're not picking up any sound. Check that your microphone is allowed and unmuted in this browser and your OS settings.",
    voiceInsecureContext: "Microphone access needs a secure connection. If you're testing on the network IP (e.g. 192.168.x.x), use http://localhost instead, or HTTPS.",
    voiceNoMic: 'No microphone was found on this device.',
    fillFormWithAI: 'Fill Form with AI',
    processingVoice: 'Processing...',
    readAloud: 'Read Form Aloud',
    clearTranscript: 'Clear',
    empty: 'empty',
    voiceNotSupported: 'Voice input is not supported in this browser. Try Chrome or Edge.',
    voiceError: 'Speech recognition error. Please try again.',
    voiceMicDenied: 'Microphone access was denied. Please allow microphone access in your browser settings.',
    voiceFillSuccess: 'Form filled from your voice report. Please review before submitting.',
    voiceFallback: 'AI assistant unavailable right now. Your description was added - please fill in the other fields manually.',
    voiceProcessError: 'Failed to process voice transcript.',
    offlineBanner: "You're offline. Submitted reports will be saved on this device and sent automatically once you're back online.",
    savedOffline: 'No connection - your report was saved on this device and will be submitted automatically once you\'re back online.',
    pendingReportsTitle: 'Pending Offline Reports',
    pendingReportsCount: '{count} report(s) waiting to sync',
    syncNow: 'Sync Now',
    syncing: 'Syncing...',
    syncSuccess: '{count} offline report(s) synced successfully!',
    syncPartial: 'Some reports could not be synced and remain saved on this device.',
    discard: 'Discard',
    photoAttached: 'Photo attached',
    savedAt: 'Saved',
    nearbyDuplicateWarning: 'Heads up: you reported "{title}" nearby on {date}, and it\'s still open. Is this the same issue?'
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
    arCamera: 'Caméra RA',
    arCaptureSuccess: 'Photo capturée avec une position RA précise!',
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
    voiceReportTitle: 'Signalement vocal',
    voiceReportDesc: 'Décrivez le problème et son emplacement à voix haute, puis laissez l\'IA remplir le formulaire pour vous.',
    startListening: 'Commencer à parler',
    stopListening: 'Arrêter l\'écoute',
    listening: 'Écoute en cours...',
    preparingToListen: 'Préparation de l\'écoute...',
    voiceListenPrompt: 'Je vous écoute, allez-y.',
    voiceTranscriptPlaceholder: 'Votre discours apparaîtra ici...',
    voiceMicSilent: "Aucun son détecté. Vérifiez que le microphone est autorisé et non coupé dans ce navigateur et dans les paramètres de votre système.",
    voiceInsecureContext: "L'accès au microphone nécessite une connexion sécurisée. Si vous testez via l'adresse IP réseau (ex. 192.168.x.x), utilisez http://localhost ou HTTPS à la place.",
    voiceNoMic: 'Aucun microphone détecté sur cet appareil.',
    fillFormWithAI: 'Remplir avec l\'IA',
    processingVoice: 'Traitement...',
    readAloud: 'Lire le formulaire',
    clearTranscript: 'Effacer',
    empty: 'vide',
    voiceNotSupported: 'La saisie vocale n\'est pas prise en charge par ce navigateur. Essayez Chrome ou Edge.',
    voiceError: 'Erreur de reconnaissance vocale. Veuillez réessayer.',
    voiceMicDenied: 'L\'accès au microphone a été refusé. Veuillez l\'autoriser dans les paramètres de votre navigateur.',
    voiceFillSuccess: 'Formulaire rempli à partir de votre signalement vocal. Veuillez vérifier avant de soumettre.',
    voiceFallback: 'Assistant IA indisponible pour le moment. Votre description a été ajoutée - veuillez remplir les autres champs manuellement.',
    voiceProcessError: 'Échec du traitement de la transcription vocale.',
    offlineBanner: 'Vous êtes hors ligne. Les rapports soumis seront enregistrés sur cet appareil et envoyés automatiquement une fois la connexion rétablie.',
    savedOffline: 'Pas de connexion - votre rapport a été enregistré sur cet appareil et sera soumis automatiquement une fois la connexion rétablie.',
    pendingReportsTitle: 'Rapports hors ligne en attente',
    pendingReportsCount: '{count} rapport(s) en attente de synchronisation',
    syncNow: 'Synchroniser',
    syncing: 'Synchronisation...',
    syncSuccess: '{count} rapport(s) hors ligne synchronisé(s) avec succès!',
    syncPartial: 'Certains rapports n\'ont pas pu être synchronisés et restent enregistrés sur cet appareil.',
    discard: 'Supprimer',
    photoAttached: 'Photo jointe',
    savedAt: 'Enregistré',
    nearbyDuplicateWarning: 'Attention : vous avez signalé "{title}" à proximité le {date}, et c\'est encore ouvert. Est-ce le même problème?'
  }
}

const NEARBY_DUPLICATE_RADIUS_KM = 0.15
const NEARBY_DUPLICATE_WINDOW_DAYS = 30

function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
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
  const [showARCamera, setShowARCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [isListening, setIsListening] = useState(false)
  const [isPrompting, setIsPrompting] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [processingVoice, setProcessingVoice] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')
  const listeningIntentRef = useRef(false)
  const transcriptionArmedRef = useRef(true)
  const transcriptionArmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [micLevel, setMicLevel] = useState(0)
  const [micSilent, setMicSilent] = useState(false)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micAudioContextRef = useRef<AudioContext | null>(null)
  const micRafRef = useRef<number | null>(null)
  const micPeakLevelRef = useRef(0)
  const micSilenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([])
  const [syncing, setSyncing] = useState(false)

  const [organization, setOrganization] = useState<OrganizationInfo | null>(null)
  const [nearbyOwnIssue, setNearbyOwnIssue] = useState<{ title: string; reportedAt: string } | null>(null)

  const t = translations[language]
  const { addToast } = useToast();

  const categoryOptions = organization?.categories?.length
    ? organization.categories.map(cat => ({ value: cat, label: cat }))
    : categories.map(cat => ({ value: cat.en, label: language === 'fr' ? cat.fr : cat.en }))

  const locationLabel = organization?.locationLabel || t.location
  const locationPlaceholder = organization?.locationLabel || t.locationPlaceholder

  const handleError = useCallback((message: string) => {
    addToast(message, 'error');
    console.error(message);
  }, [addToast]);

  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechRecognitionCtor)

    return () => {
      listeningIntentRef.current = false
      recognitionRef.current?.stop()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      if (transcriptionArmTimeoutRef.current) clearTimeout(transcriptionArmTimeoutRef.current)
      stopMicLevelMeter()
    }
  }, [])

  useEffect(() => {
    if (!session?.access_token) return

    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/organizations/me`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOrganization(data.organization || null))
      .catch(err => {
        console.error('Organization fetch error:', err)
        setOrganization(null)
      })
  }, [session?.access_token])

  // Non-blocking nudge: once we have GPS coordinates and a category, check
  // whether this citizen already has an open report nearby so they don't
  // accidentally file a duplicate. Never blocks submission.
  useEffect(() => {
    const { lat, lng } = formData.coordinates
    if (!session?.access_token || lat == null || lng == null || !formData.category) {
      setNearbyOwnIssue(null)
      return
    }

    let cancelled = false
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/my-issues`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (cancelled) return
        const cutoff = Date.now() - NEARBY_DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000
        const match = (data.issues || []).find((issue: any) =>
          issue.coordinates?.lat != null &&
          issue.coordinates?.lng != null &&
          issue.category === formData.category &&
          issue.status !== 'resolved' &&
          issue.status !== 'rejected' &&
          new Date(issue.reportedAt).getTime() >= cutoff &&
          haversineDistanceKm({ lat, lng }, issue.coordinates) <= NEARBY_DUPLICATE_RADIUS_KM
        )
        setNearbyOwnIssue(match ? { title: match.title, reportedAt: match.reportedAt } : null)
      })
      .catch(() => {
        if (!cancelled) setNearbyOwnIssue(null)
      })

    return () => { cancelled = true }
  }, [session?.access_token, formData.coordinates.lat, formData.coordinates.lng, formData.category])

  const refreshPendingReports = useCallback(async () => {
    try {
      const reports = await getAllPendingReports()
      setPendingReports(reports)
    } catch (err) {
      console.error('Failed to load pending offline reports:', err)
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!session?.access_token) return
    const pending = await getAllPendingReports()
    if (pending.length === 0) return

    setSyncing(true)
    try {
      const { synced, failed } = await syncPendingReports(session.access_token)
      await refreshPendingReports()
      if (synced > 0) {
        addToast(t.syncSuccess.replace('{count}', String(synced)), 'success')
      }
      if (failed > 0) {
        addToast(t.syncPartial, 'error')
      }
    } finally {
      setSyncing(false)
    }
  }, [session, t, addToast, refreshPendingReports])

  useEffect(() => {
    refreshPendingReports()
    if (navigator.onLine) {
      syncNow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncNow()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncNow])

  const discardPendingReport = async (id: string) => {
    await deletePendingReport(id)
    await refreshPendingReports()
  }

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

  const handleARCapture = async (dataUrl: string, coords: { lat: number; lng: number }) => {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `ar-capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      handlePhotoSelect(file)
    } catch (err) {
      console.error('Failed to process AR photo:', err)
    }

    setFormData(prev => ({ ...prev, coordinates: coords }))
    setShowARCamera(false)
    addToast(t.arCaptureSuccess, 'success')

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${coords.lat}+${coords.lng}&key=demo&limit=1`
      )
      const data = await response.json()
      const formatted = data.results?.[0]?.formatted
      setFormData(prev => ({
        ...prev,
        location: prev.location || formatted || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }))
    } catch {
      setFormData(prev => ({
        ...prev,
        location: prev.location || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      priority: 'medium',
      coordinates: { lat: null, lng: null }
    })
    removePhoto()
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
        category: categoryOptions.find(option => option.value === formData.category)?.value || formData.category
      }

      if (!navigator.onLine) {
        await savePendingReport({ data: issueData, photo: photo || null, photoName: photo?.name || null })
        await refreshPendingReports()
        addToast(t.savedOffline, 'success')
        resetForm()
        return
      }

      let response: Response
      try {
        response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(issueData)
        })
      } catch (networkError) {
        // The request couldn't even reach the server (offline / dropped
        // connection) - queue it locally instead of surfacing an error.
        console.warn('Network error submitting issue, saving offline:', networkError)
        await savePendingReport({ data: issueData, photo: photo || null, photoName: photo?.name || null })
        await refreshPendingReports()
        addToast(t.savedOffline, 'success')
        resetForm()
        return
      }

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
      resetForm()
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

  // Independent of SpeechRecognition (which only reports "no-speech"/silence,
  // not whether the mic itself is receiving any signal). Runs its own
  // getUserMedia + AnalyserNode so the UI can show real audio activity and,
  // if there's none for a few seconds, tell the user to check mic
  // permissions/hardware instead of just retrying recognition forever.
  const startMicLevelMeter = async () => {
    if (!window.isSecureContext) {
      // getUserMedia is hard-blocked by the browser on insecure origins
      // (anything but https:// or localhost) — this fails identically to a
      // permission denial but with no prompt and no recognizable error,
      // which is why a flat meter + working mic in other apps points here.
      console.error('Mic level meter unavailable: insecure context', window.location.origin)
      handleError(t.voiceInsecureContext)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('Mic level meter unavailable: navigator.mediaDevices.getUserMedia missing')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      const AudioContextCtor = (window as any).AudioContext || (window as any).webkitAudioContext
      const audioContext: AudioContext = new AudioContextCtor()
      micAudioContextRef.current = audioContext
      // Contexts can come up "suspended" (autoplay-gesture policy) even when
      // created right after a click, especially once an `await` separates
      // construction from the gesture — left unresumed, the analyser reads
      // all-zero data forever, which looks identical to "mic not working".
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.6
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      micPeakLevelRef.current = 0
      setMicSilent(false)

      if (micSilenceTimeoutRef.current) clearTimeout(micSilenceTimeoutRef.current)
      micSilenceTimeoutRef.current = setTimeout(() => {
        if (micPeakLevelRef.current < 0.03) setMicSilent(true)
      }, 4000)

      const tick = () => {
        if (audioContext.state !== 'running') audioContext.resume().catch(() => {})
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((sum, v) => sum + v, 0) / data.length
        const level = Math.min(1, avg / 80)
        micPeakLevelRef.current = Math.max(micPeakLevelRef.current, level)
        if (level >= 0.03) setMicSilent(false)
        setMicLevel(level)
        micRafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (err: any) {
      console.error('Mic level meter unavailable:', err?.name, err?.message)
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        handleError(t.voiceMicDenied)
      } else if (err?.name === 'NotFoundError') {
        handleError(t.voiceNoMic)
      }
    }
  }

  const stopMicLevelMeter = () => {
    if (micRafRef.current) cancelAnimationFrame(micRafRef.current)
    micRafRef.current = null
    if (micSilenceTimeoutRef.current) clearTimeout(micSilenceTimeoutRef.current)
    micSilenceTimeoutRef.current = null
    micStreamRef.current?.getTracks().forEach(track => track.stop())
    micStreamRef.current = null
    micAudioContextRef.current?.close().catch(() => {})
    micAudioContextRef.current = null
    setMicLevel(0)
    setMicSilent(false)
  }

  const createRecognition = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) return null

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      // Recognition starts immediately on click to keep the user-gesture
      // window (Chrome can silently no-op mic capture if .start() runs
      // outside it, e.g. inside a later async callback). While the
      // "Listening, go on" prompt is still speaking, discard results so
      // the mic doesn't transcribe its own prompt audio.
      if (!transcriptionArmedRef.current) return

      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += part + ' '
        } else {
          interim += part
        }
      }
      setInterimTranscript(interim)
      setVoiceTranscript((finalTranscriptRef.current + interim).trim())
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      // Mobile browsers fire "no-speech"/"aborted" frequently during brief
      // pauses even in continuous mode; treat as transient and let onend
      // restart the listener instead of surfacing an error to the user.
      if (event.error === 'no-speech' || event.error === 'aborted') return

      listeningIntentRef.current = false
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        handleError(t.voiceMicDenied)
      } else {
        handleError(t.voiceError)
      }
    }

    recognition.onend = () => {
      if (listeningIntentRef.current) {
        restartRecognition()
        return
      }
      setIsListening(false)
    }

    return recognition
  }

  // Browsers reliably throw if .start() is called synchronously on a session
  // that just ended (especially on mobile), which would otherwise silently
  // kill listening the first time the recognizer auto-ends. Spin up a fresh
  // instance after a short delay instead of reusing the exhausted one.
  const restartRecognition = () => {
    setInterimTranscript('')
    window.setTimeout(() => {
      if (!listeningIntentRef.current) return
      const recognition = createRecognition()
      if (!recognition) {
        listeningIntentRef.current = false
        setIsListening(false)
        return
      }
      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch (err) {
        console.error('Failed to restart speech recognition:', err)
        listeningIntentRef.current = false
        setIsListening(false)
      }
    }, 300)
  }

  const beginListening = () => {
    const recognition = createRecognition()
    if (!recognition) {
      handleError(t.voiceNotSupported)
      return
    }

    finalTranscriptRef.current = ''
    setVoiceTranscript('')
    setInterimTranscript('')
    recognitionRef.current = recognition
    listeningIntentRef.current = true
    try {
      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      listeningIntentRef.current = false
      handleError(t.voiceError)
      return
    }
    setIsListening(true)
    startMicLevelMeter()
  }

  const armTranscription = () => {
    if (transcriptionArmTimeoutRef.current) {
      clearTimeout(transcriptionArmTimeoutRef.current)
      transcriptionArmTimeoutRef.current = null
    }
    transcriptionArmedRef.current = true
    setIsPrompting(false)
  }

  const startVoiceCapture = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      handleError(t.voiceNotSupported)
      return
    }

    // Start recognition synchronously, in direct response to the click, so
    // the mic capture stays inside the user-gesture window. The "Listening,
    // go on" prompt plays at the same time; its results are discarded via
    // transcriptionArmedRef until it finishes, so it doesn't transcribe
    // itself.
    transcriptionArmedRef.current = false
    beginListening()

    if ('speechSynthesis' in window) {
      setIsPrompting(true)
      try {
        const utterance = new SpeechSynthesisUtterance(t.voiceListenPrompt)
        utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
        utterance.onend = armTranscription
        utterance.onerror = armTranscription
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.error('speechSynthesis.speak failed:', err)
      }
      // speechSynthesis end/error events are unreliable across browsers
      // (notably right after cancel()+speak(), or before voices finish
      // loading) — a missed event must never permanently disable
      // transcription, so this fallback guarantees arming regardless.
      transcriptionArmTimeoutRef.current = setTimeout(armTranscription, 2500)
    } else {
      armTranscription()
    }
  }

  const stopVoiceCapture = () => {
    if (transcriptionArmTimeoutRef.current) {
      clearTimeout(transcriptionArmTimeoutRef.current)
      transcriptionArmTimeoutRef.current = null
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsPrompting(false)
    listeningIntentRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    stopMicLevelMeter()
  }

  const clearVoiceTranscript = () => {
    finalTranscriptRef.current = ''
    setVoiceTranscript('')
    setInterimTranscript('')
  }

  const processVoiceTranscript = async () => {
    if (!voiceTranscript.trim() || !session?.access_token) return

    setProcessingVoice(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/voice-parse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ transcript: voiceTranscript })
        }
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || t.voiceProcessError)

      if (data.extracted) {
        const extracted = data.extracted
        setFormData(prev => ({
          ...prev,
          title: extracted.title || prev.title,
          description: extracted.description || prev.description,
          category: categoryOptions.find(option => option.value === extracted.category)?.value || prev.category,
          location: extracted.location || prev.location,
          priority: extracted.priority || prev.priority
        }))
        addToast(t.voiceFillSuccess, 'success')
      } else {
        setFormData(prev => ({
          ...prev,
          description: prev.description ? `${prev.description} ${voiceTranscript}` : voiceTranscript
        }))
        addToast(t.voiceFallback, 'success')
      }

      clearVoiceTranscript()
    } catch (err: any) {
      console.error('Voice parse error:', err)
      handleError(err.message || t.voiceProcessError)
    } finally {
      setProcessingVoice(false)
    }
  }

  const speakFormSummary = () => {
    if (!('speechSynthesis' in window)) return

    const summary = [
      `${t.issueTitle}: ${formData.title || t.empty}.`,
      `${t.description}: ${formData.description || t.empty}.`,
      `${t.category}: ${formData.category || t.empty}.`,
      `${t.location}: ${formData.location || t.empty}.`
    ].join(' ')

    const utterance = new SpeechSynthesisUtterance(summary)
    utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      {showARCamera && (
        <ARCamera
          language={language}
          onCapture={handleARCapture}
          onClose={() => setShowARCamera(false)}
        />
      )}
      <div className="max-w-2xl mx-auto animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{t.title}</span>
              </CardTitle>
              <CardDescription>
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isOnline && (
                <Alert variant="warning" className="mb-4">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>{t.offlineBanner}</AlertDescription>
                </Alert>
              )}

              {pendingReports.length > 0 && (
                <div className="mb-4 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <CloudUpload className="h-4 w-4 text-info" />
                        {t.pendingReportsTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t.pendingReportsCount.replace('{count}', String(pendingReports.length))}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={syncNow}
                      disabled={!isOnline || syncing}
                    >
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {syncing ? t.syncing : t.syncNow}
                    </Button>
                  </div>

                  <ul className="space-y-2">
                    {pendingReports.map((report) => (
                      <li
                        key={report.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{report.data.title || t.issueTitle}</p>
                          <p className="text-muted-foreground truncate">{report.data.location}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {t.savedAt} {new Date(report.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                            {report.photo && (
                              <span className="flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                {t.photoAttached}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => discardPendingReport(report.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={t.discard}
                          title={t.discard}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Collapsible open={voiceOpen} onOpenChange={setVoiceOpen} className="rounded-xl border border-border bg-muted/40">
                  <CollapsibleTrigger asChild>
                    <button type="button" className="flex w-full items-center justify-between gap-2 p-4 text-left">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <div>
                          <h3 className="font-medium text-foreground">{t.voiceReportTitle}</h3>
                          <p className="text-sm text-muted-foreground">{t.voiceReportDesc}</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0", voiceOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 px-4 pb-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={speakFormSummary}
                        aria-label={t.readAloud}
                      >
                        <Volume2 className="h-4 w-4" />
                        {t.readAloud}
                      </Button>
                    </div>

                    {!voiceSupported ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {t.voiceNotSupported}
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {!isListening && !isPrompting ? (
                            <Button type="button" onClick={startVoiceCapture}>
                              <Mic className="h-4 w-4" />
                              {t.startListening}
                            </Button>
                          ) : (
                            <Button type="button" onClick={stopVoiceCapture} variant="destructive">
                              {isPrompting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MicOff className="h-4 w-4" />
                              )}
                              {t.stopListening}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={processVoiceTranscript}
                            disabled={!voiceTranscript.trim() || processingVoice}
                          >
                            {processingVoice ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            {processingVoice ? t.processingVoice : t.fillFormWithAI}
                          </Button>
                          {voiceTranscript && (
                            <Button type="button" variant="ghost" onClick={clearVoiceTranscript}>
                              {t.clearTranscript}
                            </Button>
                          )}
                        </div>

                        {isPrompting && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2" role="status">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t.preparingToListen}
                          </p>
                        )}

                        {isListening && (
                          <div className="space-y-1.5">
                            <p className="text-sm text-info flex items-center gap-2" role="status">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
                              </span>
                              {t.listening}
                            </p>
                            <div className="h-1.5 w-full max-w-40 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-info transition-[width] duration-100 ease-out"
                                style={{ width: `${Math.round(micLevel * 100)}%` }}
                              />
                            </div>
                            {micSilent && (
                              <p className="text-sm text-warning flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {t.voiceMicSilent}
                              </p>
                            )}
                          </div>
                        )}

                        <div
                          className="min-h-12 rounded-xl border border-border bg-background/50 p-3 text-sm text-foreground"
                          aria-live="polite"
                          role="status"
                        >
                          {finalTranscriptRef.current.trim() || interimTranscript ? (
                            <>
                              {finalTranscriptRef.current.trim()}
                              {interimTranscript && (
                                <span className="text-muted-foreground italic"> {interimTranscript}</span>
                              )}
                              {isListening && <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-primary align-middle h-3.5" />}
                            </>
                          ) : (
                            <span className="text-muted-foreground">{t.voiceTranscriptPlaceholder}</span>
                          )}
                        </div>
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <div className="space-y-2">
                  <Label htmlFor="title">{t.issueTitle} *</Label>
                  <Input
                    id="title"
                    placeholder={t.issueTitlePlaceholder}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.description} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t.descriptionPlaceholder}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t.category} *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.categoryPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">{t.priority}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  <Label htmlFor="location">{locationLabel} *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder={locationPlaceholder}
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                      className="flex-1"
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
                    <Badge variant="outline">
                      GPS: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                    </Badge>
                  )}
                  {nearbyOwnIssue && (
                    <Alert variant="info">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t.nearbyDuplicateWarning
                          .replace('{title}', nearbyOwnIssue.title)
                          .replace('{date}', new Date(nearbyOwnIssue.reportedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'))}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t.photo}</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t.photoNote}
                  </p>

                  <div className="space-y-3">
                    {photoPreview && (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Issue photo preview"
                          className="w-full max-w-sm h-48 object-cover rounded-xl border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={removePhoto}
                          className="absolute top-2 right-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTakePhoto}
                        className={cn("gap-2", !photoPreview && "h-12")}
                      >
                        <Camera className="h-4 w-4" />
                        <span>{t.takePhoto}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadPhoto}
                        className={cn("gap-2", !photoPreview && "h-12")}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{t.uploadPhoto}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowARCamera(true)}
                        className={cn("gap-2", !photoPreview && "h-12")}
                      >
                        <Scan className="h-4 w-4" />
                        <span>{t.arCamera}</span>
                      </Button>
                    </div>
                  </div>

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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {t.requiredFields}
                  </p>

                  <Button type="submit" disabled={loading || photoUploading} className="w-full sm:w-auto">
                    {loading || photoUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
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
    </>
  )
}
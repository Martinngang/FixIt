import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button.tsx"
import { Badge } from "./ui/badge.tsx"
import { X, Crosshair, Compass, MapPin, Loader2, AlertCircle, Camera as CameraIcon } from 'lucide-react'
import { projectId } from "../utils/supabase/info.ts"

interface NearbyIssue {
  id: string
  title: string
  category: string
  status: string
  coordinates: { lat: number; lng: number }
  distance: number
}

interface ARCameraProps {
  language?: 'en' | 'fr'
  onCapture: (photoDataUrl: string, coordinates: { lat: number; lng: number }) => void
  onClose: () => void
}

const translations = {
  en: {
    cameraError: 'Unable to access camera. Please check permissions and try again.',
    locationError: 'Unable to access your location. Please enable location services.',
    gettingLocation: 'Locating...',
    enableCompass: 'Enable Compass',
    instructions: 'Point your camera at the issue, then tap the shutter to pin its exact location.',
    nearbyIssuesFound: 'nearby issue(s) shown on screen',
  },
  fr: {
    cameraError: 'Impossible d\'accéder à la caméra. Vérifiez les autorisations et réessayez.',
    locationError: 'Impossible d\'accéder à votre position. Veuillez activer les services de localisation.',
    gettingLocation: 'Localisation...',
    enableCompass: 'Activer la boussole',
    instructions: 'Pointez votre caméra vers le problème, puis appuyez sur le déclencheur pour épingler son emplacement exact.',
    nearbyIssuesFound: 'problème(s) à proximité affiché(s) à l\'écran',
  }
}

// Horizontal field of view approximation for typical phone rear cameras, in degrees
const CAMERA_FOV = 60
const NEARBY_RADIUS_METERS = 2000

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function ARCamera({ language = 'en', onCapture, onClose }: ARCameraProps) {
  const t = translations[language]
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [needsOrientationPermission, setNeedsOrientationPermission] = useState(false)
  const [nearbyIssues, setNearbyIssues] = useState<NearbyIssue[]>([])
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    let mounted = true
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => {
        console.error('Camera error:', err)
        setError(t.cameraError)
      })

    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setError((prev) => prev || t.locationError)
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude })
        setAccuracy(position.coords.accuracy)
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError((prev) => prev || t.locationError)
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const compass = (event as any).webkitCompassHeading
      if (typeof compass === 'number') {
        setHeading(compass)
      } else if (event.alpha !== null) {
        setHeading(360 - event.alpha)
      }
    }

    const DOE: any = (window as any).DeviceOrientationEvent
    if (DOE && typeof DOE.requestPermission === 'function') {
      setNeedsOrientationPermission(true)
      return
    }

    window.addEventListener('deviceorientationabsolute', handleOrientation, true)
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  const requestOrientationPermission = async () => {
    try {
      const DOE: any = (window as any).DeviceOrientationEvent
      const result = await DOE.requestPermission()
      if (result === 'granted') {
        setNeedsOrientationPermission(false)
        const handleOrientation = (event: DeviceOrientationEvent) => {
          const compass = (event as any).webkitCompassHeading
          if (typeof compass === 'number') setHeading(compass)
          else if (event.alpha !== null) setHeading(360 - event.alpha)
        }
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    } catch (err) {
      console.error('Orientation permission error:', err)
    }
  }

  useEffect(() => {
    if (!coordinates) return
    let cancelled = false

    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return
        const issues = (data.issues || [])
          .filter((issue: any) => issue.coordinates?.lat && issue.coordinates?.lng)
          .map((issue: any) => ({
            id: issue.id,
            title: issue.title,
            category: issue.category,
            status: issue.status,
            coordinates: issue.coordinates,
            distance: getDistance(coordinates.lat, coordinates.lng, issue.coordinates.lat, issue.coordinates.lng),
          }))
          .filter((issue: NearbyIssue) => issue.distance <= NEARBY_RADIUS_METERS)
          .sort((a: NearbyIssue, b: NearbyIssue) => a.distance - b.distance)
          .slice(0, 10)
        setNearbyIssues(issues)
      })
      .catch((err) => console.error('Failed to fetch nearby issues:', err))

    return () => { cancelled = true }
  }, [coordinates?.lat, coordinates?.lng])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !coordinates) return
    setCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    onCapture(dataUrl, coordinates)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex items-center justify-between gap-2 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-6 w-6" />
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-2 text-white text-sm">
          {coordinates ? (
            <Badge variant="outline" className="text-white border-white/40 bg-black/30">
              <MapPin className="h-3 w-3 mr-1" />
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              {accuracy ? ` (±${Math.round(accuracy)}m)` : ''}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-white border-white/40 bg-black/30">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {t.gettingLocation}
            </Badge>
          )}
          {heading !== null && (
            <Badge variant="outline" className="text-white border-white/40 bg-black/30">
              <Compass className="h-3 w-3 mr-1" />
              {Math.round(heading)}°
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-4 right-4 z-20 bg-destructive/90 text-white p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {needsOrientationPermission && (
        <div className="absolute top-20 left-4 right-4 z-20 flex justify-center">
          <Button onClick={requestOrientationPermission} className="bg-blue-600 text-white hover:bg-blue-700">
            <Compass className="h-4 w-4 mr-2" />
            {t.enableCompass}
          </Button>
        </div>
      )}

      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="h-10 w-10 text-white/80" />
        </div>

        {coordinates && heading !== null && nearbyIssues.map((issue) => {
          const bearing = getBearing(coordinates.lat, coordinates.lng, issue.coordinates.lat, issue.coordinates.lng)
          const relative = (((bearing - heading + 540) % 360) - 180)
          if (Math.abs(relative) > CAMERA_FOV / 2) return null
          const leftPercent = 50 + (relative / (CAMERA_FOV / 2)) * 50
          const scale = Math.max(0.6, 1 - issue.distance / NEARBY_RADIUS_METERS)
          return (
            <div
              key={issue.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${leftPercent}%`, top: '35%', transform: `translate(-50%, -50%) scale(${scale})` }}
            >
              <div className="bg-blue-600/90 text-white rounded-full p-2 shadow-lg border-2 border-white">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="mt-1 bg-black/70 text-white text-xs rounded px-2 py-1 max-w-[140px] text-center">
                <div className="truncate font-medium">{issue.title}</div>
                <div className="text-white/70">{formatDistance(issue.distance)}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative z-10 mt-auto p-6 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm text-center mb-4">
          {nearbyIssues.length > 0
            ? `${nearbyIssues.length} ${t.nearbyIssuesFound}`
            : t.instructions}
        </p>
        <div className="flex justify-center">
          <Button
            onClick={handleCapture}
            disabled={!coordinates || capturing}
            className="h-16 w-16 rounded-full bg-white hover:bg-white/90 p-0 border-4 border-blue-600"
          >
            {capturing ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : <CameraIcon className="h-6 w-6 text-blue-600" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

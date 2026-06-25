export interface CityModelIssue {
  id: string
  title: string
  category: string
  location: string
  priority: 'low' | 'medium' | 'high'
  status: string
  coordinates: { lat: number; lng: number } | null
  reportedAt: string
}

export const STATUS_COLORS: Record<string, string> = {
  reported: '#F59E0B',
  'in-progress': '#0EA5E9',
  resolved: '#10B981',
  rejected: '#F43F5E',
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

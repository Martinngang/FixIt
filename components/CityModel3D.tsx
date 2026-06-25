import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { type CityModelIssue, STATUS_COLORS } from '../utils/cityModel.ts'

export type { CityModelIssue }

const PRIORITY_HEIGHT: Record<string, number> = {
  low: 1.5,
  medium: 2.75,
  high: 4,
}

const CITY_SIZE = 40

// Deterministic pseudo-random generator so the procedural skyline stays
// stable across re-renders instead of jumping around every time the
// filters change and the component re-mounts.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function Buildings() {
  const buildings = useMemo(() => {
    const items: { position: [number, number, number]; size: [number, number, number]; color: string }[] = []
    const gridCount = 12
    const spacing = CITY_SIZE / gridCount
    let seed = 1

    for (let i = 0; i < gridCount; i++) {
      for (let j = 0; j < gridCount; j++) {
        seed += 1
        if (seededRandom(seed) < 0.35) continue // leave gaps for streets/plazas

        const height = 0.5 + seededRandom(seed * 2) * 6
        const width = 0.6 + seededRandom(seed * 3) * 0.8
        const x = -CITY_SIZE / 2 + spacing * i + spacing / 2
        const z = -CITY_SIZE / 2 + spacing * j + spacing / 2
        const shade = 55 + Math.floor(seededRandom(seed * 4) * 30)

        items.push({
          position: [x, height / 2, z],
          size: [width, height, width],
          color: `hsl(220, 15%, ${shade}%)`,
        })
      }
    }

    return items
  }, [])

  return (
    <>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </>
  )
}

function IssueMarker({
  issue,
  position,
  isSelected,
  onSelect,
}: {
  issue: CityModelIssue
  position: [number, number, number]
  isSelected: boolean
  onSelect: (issue: CityModelIssue) => void
}) {
  const [hovered, setHovered] = useState(false)
  const height = PRIORITY_HEIGHT[issue.priority] || PRIORITY_HEIGHT.medium
  const color = STATUS_COLORS[issue.status] || '#6366F1'
  const glow = isSelected ? 1 : hovered ? 0.8 : 0.25

  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        onClick={(e: any) => {
          e.stopPropagation()
          onSelect(issue)
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <cylinderGeometry args={[0.15, 0.15, height, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} />
      </mesh>
      <mesh position={[0, height + 0.35, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow + 0.2} />
      </mesh>
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.75, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

export function CityModel3D({
  issues,
  selectedIssueId,
  onSelectIssue,
  autoRotate = false,
  isDarkMode = false,
}: {
  issues: CityModelIssue[]
  selectedIssueId: string | null
  onSelectIssue: (issue: CityModelIssue) => void
  autoRotate?: boolean
  isDarkMode?: boolean
}) {
  const positioned = useMemo(() => {
    const withCoords = issues.filter((i) => i.coordinates)
    if (withCoords.length === 0) return []

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    for (const issue of withCoords) {
      const { lat, lng } = issue.coordinates!
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
    }

    const latRange = maxLat - minLat || 1
    const lngRange = maxLng - minLng || 1
    const span = CITY_SIZE - 6

    return withCoords.map((issue) => {
      const { lat, lng } = issue.coordinates!
      const x = ((lng - minLng) / lngRange - 0.5) * span
      const z = ((lat - minLat) / latRange - 0.5) * span * -1
      return { issue, position: [x, 0, z] as [number, number, number] }
    })
  }, [issues])

  return (
    <Canvas camera={{ position: [0, 28, 32], fov: 45 }} shadows>
      <color attach="background" args={[isDarkMode ? '#0B0F1A' : '#dbeafe']} />
      <ambientLight intensity={isDarkMode ? 0.35 : 0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
        <meshStandardMaterial color={isDarkMode ? '#141B2E' : '#e2e8f0'} />
      </mesh>
      <gridHelper args={isDarkMode ? [CITY_SIZE, 20, '#475569', '#1e293b'] : [CITY_SIZE, 20, '#94a3b8', '#cbd5e1']} />

      <Buildings />

      {positioned.map(({ issue, position }) => (
        <IssueMarker
          key={issue.id}
          issue={issue}
          position={position}
          isSelected={issue.id === selectedIssueId}
          onSelect={onSelectIssue}
        />
      ))}

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={60}
      />
    </Canvas>
  )
}

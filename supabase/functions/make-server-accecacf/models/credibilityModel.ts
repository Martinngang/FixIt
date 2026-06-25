import * as kv from '../kv_store.tsx'
import { haversineDistance } from './dispatchModel.ts'

const NEARBY_RADIUS_KM = 0.15
const CORROBORATION_WINDOW_DAYS = 30
const REJECTION_RATE_THRESHOLD = 0.4
const MIN_REPORTS_FOR_TRUST_PENALTY = 3

export interface ReporterTrust {
  userId: string
  totalReports: number
  resolvedReports: number
  rejectedReports: number
}

export interface CredibilitySignals {
  hasPhoto: boolean
  hasCoordinates: boolean
  descriptionLength: number
  corroboratingReports: number
  upvotes: number
  reporterRejectionRate: number | null
}

export interface CredibilityResult {
  score: number
  level: 'high' | 'medium' | 'low'
  signals: CredibilitySignals
}

// Derives a credibility score purely from objective signals already present
// in the system - evidence completeness, corroboration from other reporters,
// and the reporter's own track record. Deliberately independent of Gemini's
// `flagged` field, which reflects emotional tone/urgency, not truthfulness,
// and of the AI classifier being available at all (it's unreliable/quota
// limited - see classifyIssue in utils/gemini.ts).
export function computeCredibility(
  issue: { description?: string; photoUrl?: string; coordinates?: { lat: number; lng: number } | null; category?: string; reportedAt?: string; reportedBy?: string; upvotes?: number },
  allIssues: { id?: string; coordinates?: { lat: number; lng: number } | null; category?: string; reportedAt?: string; reportedBy?: string }[],
  reporterTrust: ReporterTrust | null
): CredibilityResult {
  let score = 50
  const descriptionLength = (issue.description || '').trim().length
  const hasPhoto = !!issue.photoUrl
  const hasCoordinates = !!issue.coordinates
  const upvotes = issue.upvotes || 0

  if (hasPhoto) score += 15
  if (hasCoordinates) score += 15

  if (descriptionLength >= 40) score += 10
  else if (descriptionLength > 0 && descriptionLength < 15) score -= 15

  const corroboratingReports = issue.coordinates
    ? countCorroboratingReports(issue, allIssues)
    : 0
  score += Math.min(corroboratingReports, 2) * 10

  score += Math.min(upvotes, 3) * 5

  let reporterRejectionRate: number | null = null
  if (reporterTrust && reporterTrust.totalReports >= MIN_REPORTS_FOR_TRUST_PENALTY) {
    reporterRejectionRate = reporterTrust.rejectedReports / reporterTrust.totalReports
    if (reporterRejectionRate > REJECTION_RATE_THRESHOLD) score -= 20
  }

  score = Math.max(0, Math.min(100, score))
  const level: CredibilityResult['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  return {
    score,
    level,
    signals: { hasPhoto, hasCoordinates, descriptionLength, corroboratingReports, upvotes, reporterRejectionRate },
  }
}

// Counts other, distinct reporters who filed a same-category issue within
// NEARBY_RADIUS_KM and CORROBORATION_WINDOW_DAYS of this one - independent
// corroboration that the problem is real, not the same person re-reporting.
function countCorroboratingReports(
  issue: { coordinates?: { lat: number; lng: number } | null; category?: string; reportedAt?: string; reportedBy?: string },
  allIssues: { coordinates?: { lat: number; lng: number } | null; category?: string; reportedAt?: string; reportedBy?: string }[]
): number {
  if (!issue.coordinates) return 0
  const cutoff = new Date(issue.reportedAt || Date.now()).getTime() - CORROBORATION_WINDOW_DAYS * 24 * 60 * 60 * 1000

  const distinctReporters = new Set<string>()
  for (const other of allIssues) {
    if (!other.coordinates || other.reportedBy === issue.reportedBy) continue
    if (other.category !== issue.category) continue
    if (new Date(other.reportedAt || 0).getTime() < cutoff) continue
    if (haversineDistance(issue.coordinates, other.coordinates) <= NEARBY_RADIUS_KM) {
      distinctReporters.add(other.reportedBy!)
    }
  }
  return distinctReporters.size
}

export async function getReporterTrust(userId: string): Promise<ReporterTrust> {
  const trust = await kv.get(`reporter_trust:${userId}`)
  return trust || { userId, totalReports: 0, resolvedReports: 0, rejectedReports: 0 }
}

// Records the terminal outcome of an issue against its reporter's trust
// record. Callers must ensure this only fires once per issue (see
// `trustOutcomeRecorded` on the issue) to avoid double-counting if a status
// flips back and forth.
export async function recordReportOutcome(reporterId: string, outcome: 'resolved' | 'rejected'): Promise<void> {
  const trust = await getReporterTrust(reporterId)
  trust.totalReports += 1
  if (outcome === 'resolved') trust.resolvedReports += 1
  else trust.rejectedReports += 1
  await kv.set(`reporter_trust:${reporterId}`, trust)
}

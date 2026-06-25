import * as kv from '../kv_store.tsx'
import * as issueModel from './issueModel.ts'
import { extractIssueFromTranscript } from '../utils/gemini.ts'
import { sendSms, fetchMmsMedia } from '../utils/twilio.ts'

const PENDING_DRAFT_WINDOW_MS = 15 * 60 * 1000

interface PendingDraft {
  title: string
  description: string
  category: string
  priority: string
  mediaUrls: string[]
  createdAt: string
}

function refCode(issueId: string): string {
  return issueId.replace(/-/g, '').slice(-8).toUpperCase()
}

async function finalizeAndCreateIssue(from: string, draft: Omit<PendingDraft, 'createdAt'> & { location: string }) {
  const issue = await issueModel.createIssue({
    title: draft.title,
    description: draft.description,
    category: draft.category,
    location: draft.location,
    priority: draft.priority,
    reportedBy: from,
    reporterName: from,
    reporterPhone: from,
    reportedVia: 'sms',
    coordinates: null,
    photoUrl: null,
    organizationId: null,
  })

  const finalIssue = await issueModel.autoAssignIssue(issue)

  let photoAttached = false
  if (draft.mediaUrls.length > 0) {
    const file = await fetchMmsMedia(draft.mediaUrls[0])
    if (file) {
      await issueModel.uploadPhoto(finalIssue.id, file, from)
      photoAttached = true
    }
  }

  const photoNote = photoAttached ? ' Your photo was attached.' : ''
  await sendSms(
    from,
    `Thanks! We've logged your ${draft.category} report (ref #${refCode(finalIssue.id)}).${photoNote} We'll text you when it's resolved.`
  )

  await issueModel.notifyAdminsOfNewIssue(finalIssue)

  return finalIssue
}

export async function handleIncomingSms({ from, body, mediaUrls }: {
  from: string
  body: string
  mediaUrls: string[]
}) {
  const trimmedBody = (body || '').trim()
  const pendingKey = `sms_pending:${from}`

  // Step 1: is this the location reply to a draft we're waiting on?
  const pending: PendingDraft | undefined = await kv.get(pendingKey)
  if (pending && Date.now() - new Date(pending.createdAt).getTime() < PENDING_DRAFT_WINDOW_MS) {
    await kv.del(pendingKey)
    await finalizeAndCreateIssue(from, {
      title: pending.title,
      description: pending.description,
      category: pending.category,
      priority: pending.priority,
      mediaUrls: pending.mediaUrls,
      location: trimmedBody || 'Location not provided',
    })
    return
  }
  if (pending) {
    // Stale draft - clear it so it doesn't resurface later and confuse a
    // genuinely new report.
    await kv.del(pendingKey)
  }

  // Step 2: status-check command.
  if (trimmedBody.toUpperCase() === 'STATUS') {
    const issues = await issueModel.getUserIssues(from)
    if (issues.length === 0) {
      await sendSms(from, "We don't have any reports on file for this number.")
      return
    }
    const latest = issues[0]
    await sendSms(from, `Report #${refCode(latest.id)} ("${latest.title}") is currently: ${latest.status}.`)
    return
  }

  // Step 3: a new report. An empty body with only a photo attached still
  // needs a category fallback and goes straight to the location follow-up
  // since there's no text for the AI to extract anything from.
  if (!trimmedBody) {
    await kv.set(pendingKey, {
      title: 'Photo report via SMS',
      description: '(No description provided)',
      category: 'Other',
      priority: 'medium',
      mediaUrls,
      createdAt: new Date().toISOString(),
    })
    await sendSms(from, "Got it! What's the location or address of the issue?")
    return
  }

  const extracted = await extractIssueFromTranscript(trimmedBody)
  const title = extracted?.title || trimmedBody.slice(0, 50)
  const description = extracted?.description || trimmedBody
  const category = extracted?.category || 'Other'
  const priority = extracted?.priority || 'medium'
  const location = extracted?.location || ''

  if (!location) {
    await kv.set(pendingKey, { title, description, category, priority, mediaUrls, createdAt: new Date().toISOString() })
    await sendSms(from, `Got it - logged as "${category}". What's the location or address of the issue?`)
    return
  }

  await finalizeAndCreateIssue(from, { title, description, category, priority, mediaUrls, location })
}

// Called by issueController.ts after a status update succeeds. Never
// throws - a failed SMS notification should never surface as an error to
// the admin/technician who just updated the issue.
export async function notifySmsReporterOfStatusChange(issue: any) {
  if (issue?.reportedVia !== 'sms') return
  if (issue.status !== 'resolved' && issue.status !== 'rejected') return

  const phone = issue.reporterPhone || issue.reportedBy
  const ref = refCode(issue.id)

  const message = issue.status === 'resolved'
    ? `Good news! Your report #${ref} has been resolved. Thank you for reporting it.`
    : `Update on report #${ref}: after review, it was marked as not actionable. Reply if you have more details.`

  await sendSms(phone, message)
}

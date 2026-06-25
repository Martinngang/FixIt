import { logger, serializeError } from './logger.ts'

export const ISSUE_CATEGORIES = [
  'Road & Transportation',
  'Water & Utilities',
  'Parks & Recreation',
  'Public Safety',
  'Waste Management',
  'Street Lighting',
  'Public Buildings',
  'Environmental',
  'Other',
] as const

export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const

export const SENTIMENT_LEVELS = ['neutral', 'frustrated', 'angry'] as const

export interface IssueClassification {
  category: typeof ISSUE_CATEGORIES[number]
  priority: typeof ISSUE_PRIORITIES[number]
  sentiment: typeof SENTIMENT_LEVELS[number]
  flagged: boolean
  reasoning: string
}

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash'

// Asks Gemini to pick the best category/priority for routing a newly
// reported issue. Returns null (rather than throwing) on any failure so
// issue creation can fall back to the citizen-supplied values.
export async function classifyIssue(title: string, description: string): Promise<IssueClassification | null> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classify this civic issue report for a municipal issue-tracking system.\n\nTitle: ${title}\nDescription: ${description}\n\nChoose the single best category and priority so the issue is routed to the correct department and technicians. Also assess the citizen's tone: "sentiment" reflects how emotionally charged the report is (neutral, frustrated, or angry), and "flagged" should be true only if the report expresses significant distress/anger or describes an urgent safety risk that needs immediate human attention.`
            }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                category: { type: 'STRING', enum: [...ISSUE_CATEGORIES] },
                priority: { type: 'STRING', enum: [...ISSUE_PRIORITIES] },
                sentiment: { type: 'STRING', enum: [...SENTIMENT_LEVELS] },
                flagged: { type: 'BOOLEAN' },
                reasoning: { type: 'STRING' },
              },
              required: ['category', 'priority', 'sentiment', 'flagged', 'reasoning'],
            },
          },
        }),
      }
    )

    if (!response.ok) {
      logger.warn('Gemini classification request failed', { status: response.status, body: await response.text() })
      return null
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      logger.warn('Gemini classification returned no content', { data })
      return null
    }

    const parsed = JSON.parse(text)
    if (
      !ISSUE_CATEGORIES.includes(parsed.category) ||
      !ISSUE_PRIORITIES.includes(parsed.priority) ||
      !SENTIMENT_LEVELS.includes(parsed.sentiment) ||
      typeof parsed.flagged !== 'boolean'
    ) {
      logger.warn('Gemini classification returned an unexpected shape', { parsed })
      return null
    }

    return parsed as IssueClassification
  } catch (error) {
    logger.warn('Gemini classification error', { error: serializeError(error) })
    return null
  }
}

export interface VoiceReportExtraction {
  title: string
  description: string
  category: typeof ISSUE_CATEGORIES[number]
  location: string
  priority: typeof ISSUE_PRIORITIES[number]
}

// Turns a raw speech-to-text transcript (from a citizen describing an issue
// out loud) into structured report fields. Returns null (rather than
// throwing) on any failure so the client can fall back to dropping the raw
// transcript into the description field for manual editing.
export async function extractIssueFromTranscript(transcript: string): Promise<VoiceReportExtraction | null> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `A citizen reported a civic issue by speaking out loud, and their speech was transcribed by speech-to-text software. Extract structured fields for a municipal issue-tracking form from this transcript.\n\nTranscript: "${transcript}"\n\nProduce: a short "title" (a few words summarizing the issue), a cleaned-up "description" (rewrite the transcript as clear sentences, removing filler words like "um" or "uh" without inventing new facts), the single best-matching "category", a "location" string containing any street names, intersections, or landmarks mentioned (use an empty string if no location was mentioned), and the appropriate "priority" based on the urgency expressed.`
            }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                description: { type: 'STRING' },
                category: { type: 'STRING', enum: [...ISSUE_CATEGORIES] },
                location: { type: 'STRING' },
                priority: { type: 'STRING', enum: [...ISSUE_PRIORITIES] },
              },
              required: ['title', 'description', 'category', 'location', 'priority'],
            },
          },
        }),
      }
    )

    if (!response.ok) {
      logger.warn('Gemini voice extraction request failed', { status: response.status, body: await response.text() })
      return null
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      logger.warn('Gemini voice extraction returned no content', { data })
      return null
    }

    const parsed = JSON.parse(text)
    if (
      typeof parsed.title !== 'string' ||
      typeof parsed.description !== 'string' ||
      !ISSUE_CATEGORIES.includes(parsed.category) ||
      typeof parsed.location !== 'string' ||
      !ISSUE_PRIORITIES.includes(parsed.priority)
    ) {
      logger.warn('Gemini voice extraction returned an unexpected shape', { parsed })
      return null
    }

    return parsed as VoiceReportExtraction
  } catch (error) {
    logger.warn('Gemini voice extraction error', { error: serializeError(error) })
    return null
  }
}

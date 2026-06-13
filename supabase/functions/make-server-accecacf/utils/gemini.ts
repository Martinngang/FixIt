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

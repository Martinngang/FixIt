import type { AppContext } from '../utils/types.ts'
import * as smsReportModel from '../models/smsReportModel.ts'
import { verifyTwilioSignature } from '../utils/twilio.ts'
import { handleError, UnauthorizedError } from '../utils/errors.ts'

export async function handleIncomingSms(c: AppContext) {
  try {
    const rawBody = await c.req.text()
    const params = new URLSearchParams(rawBody)
    const paramsObject: Record<string, string> = {}
    for (const [key, value] of params) paramsObject[key] = value

    const signature = c.req.header('x-twilio-signature') ?? null
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-accecacf/webhooks/twilio-sms`

    const isValid = await verifyTwilioSignature(webhookUrl, paramsObject, signature)
    if (!isValid) throw new UnauthorizedError('Invalid Twilio signature')

    const from = params.get('From') || ''
    const body = params.get('Body') || ''
    const numMedia = Number(params.get('NumMedia') || '0')
    const mediaUrls: string[] = []
    for (let i = 0; i < numMedia; i++) {
      const url = params.get(`MediaUrl${i}`)
      if (url) mediaUrls.push(url)
    }

    if (!from) throw new UnauthorizedError('Missing sender phone number')

    await smsReportModel.handleIncomingSms({ from, body, mediaUrls })

    return c.json({ received: true })
  } catch (error) {
    return handleError(c, error, 'Failed to process incoming SMS')
  }
}

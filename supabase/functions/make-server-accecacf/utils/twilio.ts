import { logger, serializeError } from './logger.ts'

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01'

function basicAuthHeader(): string {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
  return `Basic ${btoa(`${accountSid}:${authToken}`)}`
}

// Twilio signs each webhook request with HMAC-SHA1 over the exact webhook
// URL it was configured to POST to, followed by every POST param appended
// in sorted-by-key order (no delimiters). Implemented directly with Deno's
// native Web Crypto rather than the Twilio SDK, the same way utils/stripe.ts
// avoids relying on Node's crypto module under Deno.
export async function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null
): Promise<boolean> {
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!authToken || !signature) return false

  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url)

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(authToken),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    )
    const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
    const expected = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
    return expected === signature
  } catch (error) {
    logger.error('Twilio signature verification error', { error: serializeError(error) })
    return false
  }
}

// Sends an outbound SMS via Twilio's REST API. Never throws - a failed
// reply (confirmation or status notification) should never block the
// inbound webhook or an admin's status update.
export async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
  if (!accountSid || !fromNumber) {
    logger.warn('Twilio not configured - skipping outbound SMS', { to })
    return false
  }

  try {
    const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: basicAuthHeader(),
      },
      body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
    })

    if (!response.ok) {
      logger.warn('Twilio send SMS request failed', { status: response.status, body: await response.text() })
      return false
    }

    return true
  } catch (error) {
    logger.error('Twilio send SMS error', { error: serializeError(error) })
    return false
  }
}

// Fetches an inbound MMS attachment from Twilio (media URLs require the
// same account credentials) and returns it as a File ready for
// issueModel.uploadPhoto. Returns null on any failure - a missing photo
// should never block the issue itself from being created.
export async function fetchMmsMedia(mediaUrl: string): Promise<File | null> {
  try {
    const response = await fetch(mediaUrl, {
      headers: { Authorization: basicAuthHeader() },
    })
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const blob = await response.blob()
    const extension = contentType.split('/')[1] || 'jpg'
    return new File([blob], `sms-photo-${Date.now()}.${extension}`, { type: contentType })
  } catch (error) {
    logger.error('Failed to fetch MMS media from Twilio', { error: serializeError(error) })
    return null
  }
}

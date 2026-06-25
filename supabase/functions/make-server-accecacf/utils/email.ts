import { logger, serializeError } from './logger.ts'

// Loaded dynamically (not as a top-level import) so that a failure to
// resolve this remote module in the deployed runtime degrades to "email
// disabled" instead of crashing the entire function on cold start.
async function getClient() {
  const hostname = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const port = Number(Deno.env.get('SMTP_PORT') || '587')
  const username = Deno.env.get('SMTP_USER')
  const password = Deno.env.get('SMTP_PASSWORD')

  if (!username || !password) return null

  try {
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    return new SMTPClient({
      connection: {
        hostname,
        port,
        tls: port === 465,
        auth: { username, password },
      },
    })
  } catch (error) {
    logger.error('Failed to load SMTP client module', { error: serializeError(error) })
    return null
  }
}

// Sends a transactional email via Gmail SMTP (App Password auth). Never
// throws - a failed staff alert should never block issue creation or any
// other request flow that triggers it.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const client = await getClient()
  if (!client) {
    logger.warn('SMTP not configured - skipping outbound email', { to, subject })
    return false
  }

  const fromName = Deno.env.get('SMTP_FROM_NAME') || 'CIRT Alerts'
  const fromAddress = Deno.env.get('SMTP_USER')!

  try {
    await client.send({
      from: `${fromName} <${fromAddress}>`,
      to,
      subject,
      html,
      content: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })
    return true
  } catch (error) {
    logger.error('SMTP send email error', { to, subject, error: serializeError(error) })
    return false
  } finally {
    try {
      await client.close()
    } catch {
      // ignore close errors - the send result above is what matters
    }
  }
}

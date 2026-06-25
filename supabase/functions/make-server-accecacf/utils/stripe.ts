import Stripe from 'npm:stripe@^17'
import { logger, serializeError } from './logger.ts'
import { ConflictError } from './errors.ts'

// Base URL of the deployed frontend, used to build Stripe Checkout and
// Connect onboarding redirect links.
export const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'

let cached: { stripe: Stripe; stripeCryptoProvider: ReturnType<typeof Stripe.createSubtleCryptoProvider> } | null = null
let failed = false

// Deno edge functions need the fetch-based HTTP client and the SubtleCrypto
// provider (webhook signature verification uses async Web Crypto, not the
// Node crypto module Stripe's SDK normally relies on).
//
// Constructed lazily (not as a top-level singleton) so that a Stripe SDK
// initialization failure - e.g. an apiVersion mismatch after a dependency
// bump - degrades to "payments unavailable" for the few routes that need
// it, instead of crashing the entire function on cold start for everyone.
function getStripeClient() {
  if (failed) return null
  if (cached) return cached

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-02-24.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })
    const stripeCryptoProvider = Stripe.createSubtleCryptoProvider()
    cached = { stripe, stripeCryptoProvider }
    return cached
  } catch (error) {
    failed = true
    logger.error('Failed to initialize Stripe client', { error: serializeError(error) })
    return null
  }
}

export function requireStripe() {
  const client = getStripeClient()
  if (!client) throw new ConflictError('Payments are not configured on this server')
  return client
}

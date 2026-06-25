import { createClient } from 'npm:@supabase/supabase-js@2'
import type { AppContext } from './types.ts'
import { UnauthorizedError } from './errors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function getAuthenticatedUser(c: AppContext) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken) throw new UnauthorizedError('Missing authorization token')

  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data.user?.id) throw new UnauthorizedError('Invalid or expired session')

  return data.user
}

// Returns the organization a user belongs to, or null for the public city
// tenant. Used to scope every multi-tenant query/mutation.
export function getOrganizationId(user: any): string | null {
  return user.user_metadata?.organizationId ?? null
}

// Best-effort tenant scope for endpoints that may be called without
// authentication (e.g. the AR camera's "nearby issues" overlay). Falls back
// to the public city tenant (null) when no valid session is present.
export async function getRequestOrganizationId(c: AppContext): Promise<string | null> {
  try {
    const user = await getAuthenticatedUser(c)
    return getOrganizationId(user)
  } catch {
    return null
  }
}

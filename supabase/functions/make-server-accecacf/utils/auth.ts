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

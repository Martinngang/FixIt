import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function listUsers() {
  const { data: authUsers, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  if (error) throw error

  const users = authUsers?.users?.map(authUser => ({
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name || 'Unknown',
    role: authUser.user_metadata?.role || 'citizen',
    categories: authUser.user_metadata?.categories || [],
    created_at: authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
    email_confirmed_at: authUser.email_confirmed_at
  })) || []

  return users
}

export async function createUser({ email, password, name, role, categories = [] }: {
  email: string
  password: string
  name: string
  role?: string
  categories?: string[]
}) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: role || 'citizen', categories },
    email_confirm: true
  })

  if (error) throw error

  return data.user
}

export async function updateUser(userId: string, updates: {
  email?: string
  user_metadata?: { role?: string; name?: string; categories?: string[] }
}) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, updates)

  if (error) throw error

  return data.user
}

export async function deleteUser(userId: string) {
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error
}

export function getEffectiveUserRole(user: any, request: any) {
  // Check for temporary role override header (for testing purposes)
  const tempRole = request.header('X-Temp-Role')
  if (tempRole && ['citizen', 'technician', 'admin'].includes(tempRole)) {
    console.log(`Using temporary role override: ${tempRole} for user ${user.id}`)
    return tempRole
  }

  // Use actual user role from metadata
  return user.user_metadata?.role || 'citizen'
}
import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from "./info.ts"

// Create singleton supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export { supabase }
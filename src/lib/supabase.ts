import { createClient } from '@supabase/supabase-js'
import type { Database } from '../tipos/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key-pendiente'

export const supabaseConfigurado =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as ReturnType<typeof createClient>

export interface Link {
  id: string
  slug: string
  original_url: string
  created_at: string
}

export interface Click {
  id: string
  link_id: string
  clicked_at: string
  referrer: string | null
  country: string | null
  device_type: string | null
  browser: string | null
  user_agent: string | null
}

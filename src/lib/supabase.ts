import { createClient } from '@supabase/supabase-js'

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-anon-key'

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const url = isValidSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : fallbackUrl

const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey

export const supabase = createClient(url, key)

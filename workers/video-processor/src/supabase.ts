import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ws from 'ws'

export function createWorkerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  })
}

export const SOCIAL_VIDEO_BUCKET = 'social-posts'
export const BUSINESS_ASSETS_BUCKET = 'business-assets'

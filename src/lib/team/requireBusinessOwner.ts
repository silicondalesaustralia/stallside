// KIT SHIM - only getServiceDb is used by the social code.
import type { SupabaseClient } from '@supabase/supabase-js'
import { socialDb } from '@/lib/socialHost/socialDb'

export async function getServiceDb(): Promise<SupabaseClient> {
  return socialDb()
}

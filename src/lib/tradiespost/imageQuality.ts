import type { SupabaseClient } from '@supabase/supabase-js'
import { hostImageQuality } from '@/lib/socialHost/hostConfig'

/** OpenAI gpt-image-2 quality tier for customer-facing social renders. */
export type SocialImageQuality = 'medium' | 'high'

export const TRADIESPOST_IMAGE_QUALITY: SocialImageQuality = 'high'
export const DEFAULT_SOCIAL_IMAGE_QUALITY: SocialImageQuality = 'medium'

/** Kit: one quality for every account, set via SOCIAL_IMAGE_QUALITY (default high). */
export async function resolveSocialImageQualityForBusiness(
  _db: SupabaseClient,
  _businessId: string,
): Promise<SocialImageQuality> {
  return hostImageQuality()
}

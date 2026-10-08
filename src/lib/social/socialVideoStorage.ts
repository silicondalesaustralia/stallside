import type { SupabaseClient } from '@supabase/supabase-js'
import {
  extensionForSocialVideoMime,
  SOCIAL_VIDEO_BUCKET,
  type SocialVideoMime,
} from '@/lib/social/videoUploadLimits'

export { SOCIAL_VIDEO_BUCKET }

export function buildSocialVideoOriginalPath(businessId: string, assetId: string, mime: SocialVideoMime): string {
  const ext = extensionForSocialVideoMime(mime)
  return `${businessId}/social/video/original/${assetId}.${ext}`
}

export function buildSocialVideoThumbnailPath(businessId: string, assetId: string): string {
  return `${businessId}/social/video/thumbs/${assetId}.webp`
}

export function buildSocialVideoProcessedPath(
  businessId: string,
  assetId: string,
  jobId: string,
): string {
  return `${businessId}/social/video/processed/${assetId}-${jobId}.mp4`
}

/** Supabase project URL - worker uses SUPABASE_URL; Vercel also has NEXT_PUBLIC_SUPABASE_URL. */
export function supabaseProjectUrl(): string {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  return url?.trim().replace(/\/$/, '') ?? ''
}

/** Env-based public URL (no client). Works when SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is set. */
export function publicSocialPostsUrl(path: string): string {
  const trimmed = path?.trim()
  if (!trimmed) return ''
  const base = supabaseProjectUrl()
  if (!base) return ''
  const normalized = trimmed.replace(/^\/+/, '')
  return `${base}/storage/v1/object/public/${SOCIAL_VIDEO_BUCKET}/${normalized}`
}

/** Official Supabase storage client public URL for the social-posts bucket. */
export function publicSocialPostsUrlFromClient(db: SupabaseClient, path: string): string {
  const trimmed = path?.trim()
  if (!trimmed) return ''
  const { data } = db.storage.from(SOCIAL_VIDEO_BUCKET).getPublicUrl(trimmed)
  return data.publicUrl?.trim() ?? ''
}

/** Prefer client getPublicUrl; fall back to env-based construction for scripts without a client. */
export function resolvePublicSocialPostsUrl(
  db: SupabaseClient | null | undefined,
  path: string,
): string {
  if (db) {
    const fromClient = publicSocialPostsUrlFromClient(db, path)
    if (fromClient) return fromClient
  }
  return publicSocialPostsUrl(path)
}

export function requirePublicSocialPostsUrl(
  db: SupabaseClient | null | undefined,
  path: string,
): string {
  const url = resolvePublicSocialPostsUrl(db, path)
  if (!url.trim()) {
    throw new Error('processed_url_generation_failed')
  }
  return url
}

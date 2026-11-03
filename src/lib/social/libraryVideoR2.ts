import { VIDEO_SOURCE_RETENTION_DAYS } from '@/lib/social/videoClips/limits'
import { extensionForSocialVideoMime, type SocialVideoMime } from '@/lib/social/videoUploadLimits'

/**
 * Library videos too large for Supabase Storage live in the R2 video sources bucket,
 * served from its public custom domain. That bucket's lifecycle rule deletes them after
 * VIDEO_SOURCE_RETENTION_DAYS. Supabase paths start with the business id, so this
 * prefix tells the two apart.
 */
export const LIBRARY_R2_PREFIX = 'library/'
export const LIBRARY_R2_RETENTION_DAYS = VIDEO_SOURCE_RETENTION_DAYS

export function isLibraryR2Path(path: string | null | undefined): path is string {
  return typeof path === 'string' && path.startsWith(LIBRARY_R2_PREFIX)
}

export function libraryR2PublicBaseUrl(): string | null {
  const raw = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, '')
  return raw && /^https:\/\//.test(raw) ? raw : null
}

export function libraryR2PublicUrl(key: string): string {
  const base = libraryR2PublicBaseUrl()
  if (!base) throw new Error('r2_public_url_not_configured')
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`
}

export function isLibraryR2PublicUrl(raw: string): boolean {
  const base = libraryR2PublicBaseUrl()
  if (!base) return false
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' && url.host === new URL(base).host
  } catch {
    return false
  }
}

export function buildLibraryR2OriginalKey(businessId: string, assetId: string, mime: SocialVideoMime): string {
  return `${LIBRARY_R2_PREFIX}${businessId}/${assetId}.${extensionForSocialVideoMime(mime)}`
}

export function buildLibraryR2ProcessedKey(businessId: string, assetId: string, jobId: string): string {
  return `${LIBRARY_R2_PREFIX}${businessId}/processed/${assetId}-${jobId}.mp4`
}

export function libraryR2ExpiresAt(createdAt: string): Date {
  return new Date(new Date(createdAt).getTime() + LIBRARY_R2_RETENTION_DAYS * 24 * 60 * 60 * 1000)
}

export function daysUntilLibraryR2Expiry(expiresAt: string, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / (24 * 60 * 60 * 1000)))
}

/** Rows created before this were deleted from R2 by the lifecycle rule. */
export function libraryR2ExpiryCutoff(now: Date = new Date()): string {
  return new Date(now.getTime() - LIBRARY_R2_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

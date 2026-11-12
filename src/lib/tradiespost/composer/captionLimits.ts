import {
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  type PlatformCaptions,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'

export const CAPTION_LIMITS: Record<SocialPublishPlatform, number> = {
  instagram: 2200,
  facebook: 63206,
  gmb: 1500,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 800,
  /** X has its own 280-character text (platform_captions.x), checked by xBlockReason. */
  x: 63206,
}

/** Strictest limit across the selected platforms (Instagram's when none selected). */
export function captionLimitFor(selected: SocialPublishPlatform[]): number {
  if (!selected.length) return CAPTION_LIMITS.instagram
  return Math.min(...selected.map((p) => CAPTION_LIMITS[p]))
}

/** The platform's own caption when written, else the main caption. */
export function effectiveCaption(platform: SocialPublishPlatform, caption: string, overrides: PlatformCaptions): string {
  const own = overrides[platform]
  return own?.trim() ? own : caption
}

/** Platforms that use the main caption as-is (X has its own text). */
export function platformsUsingMainCaption(selected: SocialPublishPlatform[], overrides: PlatformCaptions) {
  return selected.filter((p) => p !== 'x' && !overrides[p]?.trim())
}

/** Missing or over-limit caption for any selected platform, named by platform. */
export function captionBlockReason(
  selected: SocialPublishPlatform[],
  caption: string,
  overrides: PlatformCaptions,
): string | null {
  const usingMain = platformsUsingMainCaption(selected, overrides)
  if (!caption.trim() && (usingMain.length || selected.every((p) => p === 'x'))) return 'Write a caption first.'
  for (const platform of selected) {
    if (platform === 'x') continue
    const length = effectiveCaption(platform, caption, overrides).length
    if (length > CAPTION_LIMITS[platform]) {
      return `${SOCIAL_PUBLISH_PLATFORM_LABELS[platform]} caption is too long (${length.toLocaleString()}/${CAPTION_LIMITS[platform].toLocaleString()}).`
    }
  }
  return null
}

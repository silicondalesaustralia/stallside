import {
  COMPOSER_PUBLISH_PLATFORMS,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import type { SocialPublishingMode } from '@/lib/social/socialPostTypes'

export function parseSchedulePlatforms(raw: unknown): SocialPublishPlatform[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((p): p is SocialPublishPlatform =>
    COMPOSER_PUBLISH_PLATFORMS.includes(p as SocialPublishPlatform),
  )
}

export function validateAutomaticPublishPlatforms(
  platforms: SocialPublishPlatform[],
  connected: SocialConnectionState,
): { ok: true } | { ok: false; message: string } {
  if (platforms.length === 0) {
    return { ok: false, message: 'Select at least one platform' }
  }
  for (const platform of platforms) {
    if (!connected[platform]) {
      return {
        ok: false,
        message:
          'Connect all selected platforms to use Automatic posting, or choose Manual posting.',
      }
    }
  }
  return { ok: true }
}

export function resolveSchedulePublishingMode(
  raw: unknown,
  platforms: SocialPublishPlatform[],
  connected: SocialConnectionState,
): { ok: true; mode: SocialPublishingMode } | { ok: false; message: string } {
  const mode = raw === 'manual' ? 'manual' : raw === 'automatic' ? 'automatic' : null
  if (!mode) {
    return { ok: false, message: 'publishingMode must be automatic or manual' }
  }
  if (platforms.length === 0) {
    return { ok: false, message: 'Select at least one platform' }
  }
  if (mode === 'automatic') {
    const check = validateAutomaticPublishPlatforms(platforms, connected)
    if (!check.ok) return check
  }
  return { ok: true, mode }
}

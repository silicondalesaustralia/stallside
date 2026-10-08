import {
  libraryAutomaticScheduleAvailable,
  localDateInputValue,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'

export type ComposerMode = 'now' | 'schedule'

export const CAPTION_LIMITS: Record<SocialPublishPlatform, number> = {
  instagram: 2200,
  facebook: 63206,
  gmb: 1500,
  tiktok: 2200,
}

/** Strictest limit across the selected platforms (Instagram's when none selected). */
export function captionLimitFor(selected: SocialPublishPlatform[]): number {
  if (!selected.length) return CAPTION_LIMITS.instagram
  return Math.min(...selected.map((p) => CAPTION_LIMITS[p]))
}

export type QuickPick = { id: string; label: string; date: string; time: string }

export function quickPicks(now = new Date()): QuickPick[] {
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const tonightAvailable = now.getHours() < 19
  return [
    tonightAvailable
      ? { id: 'tonight', label: 'Tonight 7pm', date: localDateInputValue(now), time: '19:00' }
      : { id: 'tomorrow-pm', label: 'Tomorrow 7pm', date: localDateInputValue(tomorrow), time: '19:00' },
    { id: 'tomorrow-am', label: 'Tomorrow 7am', date: localDateInputValue(tomorrow), time: '07:00' },
  ]
}

function formatScheduleLabel(date: string, time: string): string {
  const d = new Date(`${date}T${time || '09:00'}:00`)
  if (Number.isNaN(d.getTime())) return 'Schedule post'
  const day = d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
  const clock = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
  return `Schedule for ${day} ${clock}`
}

export function submitLabel(params: {
  mode: ComposerMode
  platforms: SocialPublishPlatform[]
  date: string
  time: string
}): string {
  if (params.mode === 'schedule') {
    return params.date ? formatScheduleLabel(params.date, params.time) : 'Pick a date'
  }
  const count = params.platforms.length
  if (count === 0) return 'Pick a platform'
  return count === 1 ? 'Post to 1 platform' : `Post to ${count} platforms`
}

/** Schedule automatically only when every selected platform is connected. */
export function schedulePublishingMode(
  selected: SocialPublishPlatform[],
  connected: SocialConnectionState,
): 'automatic' | 'manual' {
  return libraryAutomaticScheduleAvailable(selected, connected) ? 'automatic' : 'manual'
}

export function composerBlockReason(params: {
  mode: ComposerMode
  selected: SocialPublishPlatform[]
  connected: SocialConnectionState
  imageUrl: string | null
  caption: string
  date: string
  isVideo?: boolean
  /** From TikTok settings when TikTok is selected and connected. */
  tiktokBlockReason?: string | null
}): string | null {
  if (!params.selected.length) return 'Pick at least one platform.'
  if (!params.imageUrl) return params.isVideo ? 'Pick a video first.' : 'Add an image first.'
  if (params.isVideo && params.selected.some((p) => p !== 'tiktok')) {
    return 'Videos post automatically to TikTok only. Deselect the other platforms.'
  }
  if (params.tiktokBlockReason) return params.tiktokBlockReason
  if (!params.caption.trim()) return 'Write a caption first.'
  if (params.caption.length > captionLimitFor(params.selected)) {
    return 'Caption is too long for one of the selected platforms.'
  }
  if (params.mode === 'now' && !params.selected.every((p) => params.connected[p])) {
    return 'Connect every selected platform to post now, or schedule it to post manually.'
  }
  if (params.mode === 'schedule' && !params.date) return 'Pick a date to schedule.'
  return null
}

export const FACEBOOK_HEADLINE_MAX = 100

/** Facebook-only caption: headline on its own first line, then the shared caption. */
export function facebookCaptionWithHeadline(headline: string, caption: string): string | null {
  const head = headline.trim()
  if (!head) return null
  return `${head}\n\n${caption.trim()}`
}

export function isAiPhotoSource(source: string | null | undefined): boolean {
  return source === 'ai_generate' || source === 'custom_prompt'
}

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

/** True when the browser clock zone differs from the business zone (scheduling uses browser time). */
export function timeZoneMismatch(businessTz: string): boolean {
  const browserTz = browserTimeZone()
  return Boolean(browserTz && browserTz !== businessTz)
}

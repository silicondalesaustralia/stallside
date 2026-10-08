import type { TikTokPostSettings } from '@/lib/social/tiktok/tiktokSettings'

export type SocialPublishPlatform = 'facebook' | 'instagram' | 'gmb' | 'tiktok'

export type SocialConnectionState = {
  facebook: boolean
  instagram: boolean
  gmb: boolean
  tiktok: boolean
}

export type LibraryPublishPlatform = Exclude<SocialPublishPlatform, 'tiktok'>

/** Library / Planner surfaces. TikTok is excluded: it needs per-post settings only Create collects. */
export const SOCIAL_PUBLISH_PLATFORMS: LibraryPublishPlatform[] = [
  'facebook',
  'instagram',
  'gmb',
]

/** Create composer (collects TikTok privacy + disclosure settings). */
export const COMPOSER_PUBLISH_PLATFORMS: SocialPublishPlatform[] = [
  ...SOCIAL_PUBLISH_PLATFORMS,
  'tiktok',
]

export const SOCIAL_PUBLISH_PLATFORM_LABELS: Record<SocialPublishPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  gmb: 'Google Business',
  tiktok: 'TikTok',
}

/** Publishing / scheduling / download from Library never charges render credits. */
export const LIBRARY_PUBLISH_USES_RENDER_CREDITS = false

/** Same connectivity rules as CreateTab. */
export function socialConnectionsFromBusiness(business: {
  facebook_page_id?: string | null
  instagram_account_id?: string | null
  gmb_account_id?: string | null
  tiktok_open_id?: string | null
} | null | undefined): SocialConnectionState {
  return {
    facebook: Boolean(business?.facebook_page_id?.trim()),
    instagram: Boolean(business?.instagram_account_id?.trim()),
    gmb: Boolean(business?.gmb_account_id?.trim()),
    tiktok: Boolean(business?.tiktok_open_id?.trim()),
  }
}

export function connectedPlatformList(connected: SocialConnectionState): LibraryPublishPlatform[] {
  return SOCIAL_PUBLISH_PLATFORMS.filter((p) => connected[p])
}

/** Preselect every connected platform (Create + Library). */
export function defaultLibrarySelectedPlatforms(
  connected: SocialConnectionState,
): LibraryPublishPlatform[] {
  return connectedPlatformList(connected)
}

export function anySocialConnected(connected: SocialConnectionState): boolean {
  return connectedPlatformList(connected).length > 0
}

export function libraryHasSavedCaption(caption: string | null | undefined): boolean {
  return Boolean(caption?.trim())
}

export function libraryPublishUiState(connected: SocialConnectionState) {
  const connectedCount = connectedPlatformList(connected).length
  return {
    connectedCount,
    anyConnected: connectedCount > 0,
    showConnectCta: connectedCount === 0,
    showPostNow: connectedCount > 0,
    /** Schedule is always available - manual posting does not require connections. */
    showSchedule: true,
    showDownload: true,
    platformsAlwaysVisible: true,
  }
}

/** Intended destination - selectable regardless of connection (manual scheduling). */
export function canSelectPlatform(_platform: SocialPublishPlatform): boolean {
  return true
}

/** Automatic publish/schedule requires the platform to be connected. */
export function canAutomaticallyPublishPlatform(
  platform: SocialPublishPlatform,
  connected: SocialConnectionState,
): boolean {
  return connected[platform]
}

export function toggleLibraryPlatform(
  selected: SocialPublishPlatform[],
  platform: SocialPublishPlatform,
): SocialPublishPlatform[] {
  if (selected.includes(platform)) return selected.filter((p) => p !== platform)
  return [...selected, platform]
}

export function selectedConnectedPlatforms(
  selected: SocialPublishPlatform[],
  connected: SocialConnectionState,
): SocialPublishPlatform[] {
  return selected.filter((p) => connected[p])
}

export type LibraryPublishGate =
  | { ok: true; platforms: SocialPublishPlatform[] }
  | { ok: false; reason: 'missing_caption' | 'no_selected_connected' }

export type LibraryScheduleGate =
  | { ok: true; platforms: SocialPublishPlatform[]; publishingMode: 'automatic' | 'manual' }
  | { ok: false; reason: 'missing_caption' | 'no_platforms' | 'automatic_requires_connections' }

/** Post now - automatic only; requires connected selected platforms. */
export function libraryCanPublish(params: {
  caption: string | null | undefined
  selected: SocialPublishPlatform[]
  connected: SocialConnectionState
}): LibraryPublishGate {
  if (!libraryHasSavedCaption(params.caption)) {
    return { ok: false, reason: 'missing_caption' }
  }
  const platforms = selectedConnectedPlatforms(params.selected, params.connected)
  if (platforms.length === 0) {
    return { ok: false, reason: 'no_selected_connected' }
  }
  return { ok: true, platforms }
}

export function libraryCanSchedule(params: {
  caption: string | null | undefined
  selected: SocialPublishPlatform[]
  connected: SocialConnectionState
  publishingMode: 'automatic' | 'manual'
}): LibraryScheduleGate {
  if (!libraryHasSavedCaption(params.caption)) {
    return { ok: false, reason: 'missing_caption' }
  }
  if (params.selected.length === 0) {
    return { ok: false, reason: 'no_platforms' }
  }
  if (params.publishingMode === 'manual') {
    return { ok: true, platforms: params.selected, publishingMode: 'manual' }
  }
  for (const platform of params.selected) {
    if (!params.connected[platform]) {
      return { ok: false, reason: 'automatic_requires_connections' }
    }
  }
  return { ok: true, platforms: params.selected, publishingMode: 'automatic' }
}

export function libraryAutomaticScheduleAvailable(
  selected: SocialPublishPlatform[],
  connected: SocialConnectionState,
): boolean {
  if (selected.length === 0) return false
  return selected.every((p) => connected[p])
}

export function libraryPublishBlockMessage(
  reason: 'missing_caption' | 'no_selected_connected',
): string {
  if (reason === 'missing_caption') return 'Add a caption before publishing.'
  return 'Select a connected platform to publish.'
}

export function libraryScheduleBlockMessage(
  reason: 'missing_caption' | 'no_platforms' | 'automatic_requires_connections',
): string {
  if (reason === 'missing_caption') return 'Add a caption before scheduling.'
  if (reason === 'no_platforms') return 'Select at least one platform.'
  return 'Connect all selected platforms to use Automatic posting, or choose Manual posting.'
}

export function libraryProcessedPhotoUrls(resultUrl: string) {
  return {
    instagram_square: [resultUrl],
    facebook: [resultUrl],
    gmb: [resultUrl],
  }
}

/** Same as Create: browser-local wall clock → UTC ISO. */
export function scheduledForFromLocalDateTime(date: string, time: string): string {
  if (!date.trim()) throw new Error('Pick a date')
  const clock = time.trim() || '09:00'
  const iso = new Date(`${date.trim()}T${clock}:00`).toISOString()
  if (iso === 'Invalid Date') throw new Error('Pick a valid date and time')
  return iso
}

export function localDateInputValue(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function libraryLocalTimezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
  } catch {
    return 'local time'
  }
}

export type LibrarySocialPostBody = {
  caption: string
  platforms: SocialPublishPlatform[]
  photoUrls: string[]
  processedPhotoUrls: ReturnType<typeof libraryProcessedPhotoUrls> & { tiktok?: string[] }
  status: 'draft' | 'scheduled'
  scheduledFor: string | null
  jobId?: string
  platformCaptions?: PlatformCaptions
  tiktokSettings?: TikTokPostSettings
  mediaType?: 'video'
  videoUrl?: string
  videoDurationSeconds?: number | null
}

/** Optional Create-only fields: TikTok settings and a video (resultUrl is then its thumbnail). */
export type ComposerPostExtras = {
  tiktokSettings?: TikTokPostSettings | null
  video?: { url: string; durationSeconds: number | null } | null
  /** Ordered TikTok photo slides; resultUrl stays the feed cover for other platforms. */
  tiktokSlides?: string[] | null
}

export type PlatformCaptions = Partial<Record<SocialPublishPlatform, string>>

/** Keep only known platforms with non-empty string captions; null when nothing remains. */
export function sanitizePlatformCaptions(raw: unknown): PlatformCaptions | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: PlatformCaptions = {}
  for (const platform of COMPOSER_PUBLISH_PLATFORMS) {
    const value = (raw as Record<string, unknown>)[platform]
    if (typeof value === 'string' && value.trim()) out[platform] = value.trim()
  }
  return Object.keys(out).length ? out : null
}

export function buildLibrarySocialPostBody(params: {
  caption: string
  platforms: SocialPublishPlatform[]
  resultUrl: string
  jobId?: string | null
  platformCaptions?: PlatformCaptions | null
  mode: 'now' | 'schedule'
  scheduledDate?: string
  scheduledTime?: string
} & ComposerPostExtras): LibrarySocialPostBody {
  const caption = params.caption.trim()
  const slides =
    !params.video && params.platforms.includes('tiktok') && params.tiktokSlides?.length
      ? params.tiktokSlides
      : null
  const processedPhotoUrls = {
    ...libraryProcessedPhotoUrls(params.resultUrl),
    ...(slides ? { tiktok: slides } : {}),
  }
  const base = {
    caption,
    platforms: params.platforms,
    photoUrls: [params.resultUrl],
    processedPhotoUrls,
    jobId: params.jobId?.trim() || undefined,
    platformCaptions: sanitizePlatformCaptions(params.platformCaptions) ?? undefined,
    ...(params.tiktokSettings && params.platforms.includes('tiktok')
      ? { tiktokSettings: params.tiktokSettings }
      : {}),
    ...(params.video
      ? {
          mediaType: 'video' as const,
          videoUrl: params.video.url,
          videoDurationSeconds: params.video.durationSeconds,
        }
      : {}),
  }
  if (params.mode === 'schedule') {
    return {
      ...base,
      status: 'scheduled',
      scheduledFor: scheduledForFromLocalDateTime(
        params.scheduledDate ?? '',
        params.scheduledTime ?? '09:00',
      ),
    }
  }
  return {
    ...base,
    status: 'draft',
    scheduledFor: null,
  }
}

export function shouldShowSquareFormatNote(
  renderPlatform: 'instagram' | 'facebook' | 'gmb',
  selected: SocialPublishPlatform[],
): boolean {
  if (renderPlatform !== 'instagram') return false
  return selected.includes('facebook') || selected.includes('gmb')
}

export type LibraryPostFetcher = (
  url: string,
  init: { method: string; headers?: Record<string, string>; body?: string },
) => Promise<{ ok: boolean; status: number; json: () => Promise<Record<string, unknown>> }>

/** Text-only create + existing publish route. Never charges render credits. */
export async function submitLibraryPostNow(
  params: {
    caption: string
    platforms: SocialPublishPlatform[]
    resultUrl: string
    jobId?: string | null
    platformCaptions?: PlatformCaptions | null
  } & ComposerPostExtras,
  fetchFn: LibraryPostFetcher,
): Promise<{ postId: string }> {
  const body = buildLibrarySocialPostBody({ ...params, mode: 'now' })
  const createRes = await fetchFn('/api/social/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const createJson = await createRes.json()
  if (!createRes.ok) {
    throw new Error(
      (typeof createJson.error === 'string' && createJson.error) || 'Could not create post',
    )
  }
  const post = createJson.post as { id?: string } | undefined
  if (!post?.id) throw new Error('Post was not created')
  const pubRes = await fetchFn(`/api/social/posts/${post.id}/publish`, { method: 'POST' })
  const pubJson = (await pubRes.json().catch(() => ({}))) as Record<string, unknown>
  if (!pubRes.ok) {
    throw new Error((typeof pubJson.error === 'string' && pubJson.error) || 'Publish failed')
  }
  return { postId: post.id }
}

export async function submitLibrarySchedule(
  params: {
    caption: string
    platforms: SocialPublishPlatform[]
    resultUrl: string
    jobId?: string | null
    platformCaptions?: PlatformCaptions | null
    scheduledDate: string
    scheduledTime: string
    publishingMode: 'automatic' | 'manual'
  } & ComposerPostExtras,
  fetchFn: LibraryPostFetcher,
): Promise<{ postId: string; scheduledFor: string }> {
  const body = buildLibrarySocialPostBody({
    ...params,
    mode: 'schedule',
  })
  const createRes = await fetchFn('/api/social/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, publishingMode: params.publishingMode }),
  })
  const createJson = await createRes.json()
  if (!createRes.ok) {
    throw new Error(
      (typeof createJson.error === 'string' && createJson.error) || 'Could not schedule post',
    )
  }
  const post = createJson.post as { id?: string } | undefined
  if (!post?.id) throw new Error('Post was not created')
  return { postId: post.id, scheduledFor: body.scheduledFor ?? '' }
}

export function scheduledTabEmptyCopy(_anyConnected: boolean) {
  return {
    title: 'No posts on your calendar yet.',
    connectHint: null,
  }
}

export function publishedTabEmptyCopy(anyConnected: boolean) {
  return {
    title: 'Nothing published through Vendl yet.',
    connectHint: anyConnected
      ? null
      : 'Connect your social accounts to publish directly, or create content in Library and publish it manually.',
  }
}

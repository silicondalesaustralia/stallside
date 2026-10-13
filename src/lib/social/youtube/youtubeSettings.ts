export const YOUTUBE_PRIVACY_OPTIONS = ['public', 'unlisted', 'private'] as const
export type YouTubePrivacy = (typeof YOUTUBE_PRIVACY_OPTIONS)[number]

export const YOUTUBE_PRIVACY_LABELS: Record<YouTubePrivacy, string> = {
  public: 'Public',
  unlisted: 'Unlisted (link only)',
  private: 'Private (only you)',
}

export const YOUTUBE_TITLE_MAX = 100
export const YOUTUBE_DESCRIPTION_MAX = 5000

export type YouTubePostSettings = {
  title: string
  privacy: YouTubePrivacy
}

export type YouTubeSettingsDraft = {
  title: string
  privacy: YouTubePrivacy
}

export const EMPTY_YOUTUBE_DRAFT: YouTubeSettingsDraft = { title: '', privacy: 'public' }

/** YouTube rejects angle brackets in titles and descriptions. */
function stripAngleBrackets(text: string): string {
  return text.replace(/[<>]/g, '')
}

export function cleanYouTubeTitle(raw: string): string {
  return stripAngleBrackets(raw).replace(/\s+/g, ' ').trim().slice(0, YOUTUBE_TITLE_MAX).trim()
}

export function cleanYouTubeDescription(raw: string): string {
  return stripAngleBrackets(raw).trim().slice(0, YOUTUBE_DESCRIPTION_MAX)
}

/** First non-empty caption line, used when the seller leaves the title blank. */
export function defaultYouTubeTitle(caption: string): string {
  const firstLine = caption.split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  return cleanYouTubeTitle(firstLine)
}

export function sanitizeYouTubeSettings(raw: unknown): YouTubePostSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const { title, privacy } = raw as Record<string, unknown>
  if (typeof title !== 'string' || typeof privacy !== 'string') return null
  const cleanTitle = cleanYouTubeTitle(title)
  if (!cleanTitle) return null
  if (!(YOUTUBE_PRIVACY_OPTIONS as readonly string[]).includes(privacy)) return null
  return { title: cleanTitle, privacy: privacy as YouTubePrivacy }
}

export function youtubeSettingsFromDraft(
  draft: YouTubeSettingsDraft,
  caption: string,
): YouTubePostSettings | null {
  const title = cleanYouTubeTitle(draft.title) || defaultYouTubeTitle(caption)
  return title ? { title, privacy: draft.privacy } : null
}

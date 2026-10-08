// Shared (client + server) TikTok post settings. No Node imports.

export const TIKTOK_PRIVACY_LEVELS = [
  'PUBLIC_TO_EVERYONE',
  'MUTUAL_FOLLOW_FRIENDS',
  'FOLLOWER_OF_CREATOR',
  'SELF_ONLY',
] as const

export type TikTokPrivacyLevel = (typeof TIKTOK_PRIVACY_LEVELS)[number]

export const TIKTOK_PRIVACY_LABELS: Record<TikTokPrivacyLevel, string> = {
  PUBLIC_TO_EVERYONE: 'Everyone',
  MUTUAL_FOLLOW_FRIENDS: 'Friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  SELF_ONLY: 'Only me',
}

export type TikTokPostSettings = {
  privacyLevel: TikTokPrivacyLevel
  disableComment: boolean
  disableDuet: boolean
  disableStitch: boolean
  /** "Your brand" - promoting the creator's own business. */
  brandOrganic: boolean
  /** "Branded content" - paid partnership with a third party. */
  brandedContent: boolean
  /** Photo posts only: TikTok picks a recommended track (the API cannot choose a song). */
  autoAddMusic: boolean
}

export type TikTokCreatorInfo = {
  creatorNickname: string
  creatorUsername: string
  creatorAvatarUrl: string | null
  privacyLevelOptions: TikTokPrivacyLevel[]
  commentDisabled: boolean
  duetDisabled: boolean
  stitchDisabled: boolean
  maxVideoPostDurationSec: number
}

export const TIKTOK_PHOTO_TITLE_MAX = 90
export const TIKTOK_CAPTION_MAX = 2200

export function isTikTokPrivacyLevel(v: unknown): v is TikTokPrivacyLevel {
  return typeof v === 'string' && (TIKTOK_PRIVACY_LEVELS as readonly string[]).includes(v)
}

export function sanitizeTikTokSettings(raw: unknown): TikTokPostSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  if (!isTikTokPrivacyLevel(r.privacyLevel)) return null
  return {
    privacyLevel: r.privacyLevel,
    disableComment: r.disableComment === true,
    disableDuet: r.disableDuet === true,
    disableStitch: r.disableStitch === true,
    brandOrganic: r.brandOrganic === true,
    brandedContent: r.brandedContent === true,
    autoAddMusic: r.autoAddMusic !== false,
  }
}

/**
 * Composer draft. TikTok UX rules: privacy has no default and interactions
 * (comment / duet / stitch) start switched off until the user turns them on.
 */
export type TikTokSettingsDraft = Omit<TikTokPostSettings, 'privacyLevel'> & {
  privacyLevel: TikTokPrivacyLevel | null
  discloseCommercial: boolean
}

export const EMPTY_TIKTOK_DRAFT: TikTokSettingsDraft = {
  privacyLevel: null,
  disableComment: true,
  disableDuet: true,
  disableStitch: true,
  brandOrganic: false,
  brandedContent: false,
  discloseCommercial: false,
  autoAddMusic: true,
}

export function tiktokDraftBlockReason(draft: TikTokSettingsDraft): string | null {
  if (!draft.privacyLevel) return 'Choose who can see your TikTok post.'
  if (draft.discloseCommercial && !draft.brandOrganic && !draft.brandedContent) {
    return 'Pick "Your brand" or "Branded content", or turn off content disclosure.'
  }
  if (draft.brandedContent && draft.privacyLevel === 'SELF_ONLY') {
    return 'Branded content can’t be private on TikTok. Change who can see it.'
  }
  return null
}

export function tiktokSettingsFromDraft(draft: TikTokSettingsDraft): TikTokPostSettings | null {
  if (tiktokDraftBlockReason(draft) || !draft.privacyLevel) return null
  return {
    privacyLevel: draft.privacyLevel,
    disableComment: draft.disableComment,
    disableDuet: draft.disableDuet,
    disableStitch: draft.disableStitch,
    brandOrganic: draft.discloseCommercial && draft.brandOrganic,
    brandedContent: draft.discloseCommercial && draft.brandedContent,
    autoAddMusic: draft.autoAddMusic,
  }
}

/** Photo posts: short title from the first line; full caption goes in the description. */
export function tiktokPhotoTitle(caption: string): string {
  const firstLine = caption.trim().split('\n')[0]?.trim() ?? ''
  if (firstLine.length <= TIKTOK_PHOTO_TITLE_MAX) return firstLine
  return `${firstLine.slice(0, TIKTOK_PHOTO_TITLE_MAX - 1).trimEnd()}…`
}

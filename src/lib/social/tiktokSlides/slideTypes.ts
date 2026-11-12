export const TIKTOK_MAX_PHOTO_SLIDES = 35
export const SLIDE_HEADING_MAX = 60
export const SLIDE_BODY_MAX = 180

/** TikTok photo mode is full-screen 9:16; the feed cover is 4:5 so Instagram accepts it. */
export const SLIDE_SIZE = { width: 1080, height: 1920 } as const
export const FEED_COVER_SIZE = { width: 1080, height: 1350 } as const

export type TikTokSlideText = { heading: string; body: string }

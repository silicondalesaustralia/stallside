/** Public Supabase Storage bucket (social project) holding the music library MP3s. */
export const MUSIC_BUCKET = 'social-music'

export const MUSIC_CATEGORIES = ['upbeat', 'fun', 'calm', 'cinematic', 'world', 'electronic', 'more'] as const
export type MusicCategory = (typeof MUSIC_CATEGORIES)[number]

export const MUSIC_CATEGORY_LABELS: Record<MusicCategory, string> = {
  upbeat: 'Upbeat & happy',
  fun: 'Fun & quirky',
  calm: 'Calm & heartfelt',
  cinematic: 'Cinematic',
  world: 'World & folk',
  electronic: 'Electronic',
  more: 'More',
}

/** One track in Vendl's music library (CC0 / public domain, no credit needed). */
export type MusicTrack = {
  id: string
  title: string
  artist: string
  category: MusicCategory
  description: string
  durationSeconds: number
  /** Path in the public social-music bucket. */
  path: string
  /** Order within its category on the source site (lower = more popular). */
  rank: number
}

/** Background music on a video: track plus volumes (0-1). */
export type MusicChoice = {
  trackId: string
  /** Music volume. */
  volume: number
  /** The video's own sound; 0 mutes it. Ignored for slideshows (no sound). */
  originalVolume: number
}

/** Music under a video with its own sound; videos without sound (slideshows) start louder. */
export const DEFAULT_MUSIC_VOLUME = 0.4
export const DEFAULT_MUSIC_ONLY_VOLUME = 0.9
export const DEFAULT_ORIGINAL_VOLUME = 1

export type MusicJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Polled by Create while the worker mixes music into a video. */
export type MusicJobView = {
  status: MusicJobStatus
  error: string | null
  video: { assetId: string; url: string; thumbnailUrl: string | null; durationSeconds: number | null } | null
}

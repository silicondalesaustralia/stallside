import catalog from './musicCatalog.json'
import {
  MUSIC_BUCKET,
  MUSIC_CATEGORIES,
  type MusicCategory,
  type MusicChoice,
  type MusicTrack,
} from './musicTypes'

export const MUSIC_TRACKS: MusicTrack[] = (catalog as MusicTrack[]).filter((t) =>
  MUSIC_CATEGORIES.includes(t.category),
)

const BY_ID = new Map(MUSIC_TRACKS.map((t) => [t.id, t]))

export function findMusicTrack(id: string | null | undefined): MusicTrack | null {
  return id ? (BY_ID.get(id) ?? null) : null
}

/** Public URL of a track; works in the browser (NEXT_PUBLIC_) and the worker (SUPABASE_URL). */
export function musicTrackUrl(track: Pick<MusicTrack, 'path'>): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${MUSIC_BUCKET}/${track.path}` : ''
}

/** Category (or all) + words in the title, artist, mood description or category. Popular first. */
export function searchMusic(params: { category: MusicCategory | 'all'; query: string }): MusicTrack[] {
  const words = params.query.toLowerCase().split(/\s+/).filter(Boolean)
  return MUSIC_TRACKS.filter((t) => {
    if (params.category !== 'all' && t.category !== params.category) return false
    if (!words.length) return true
    const hay = `${t.title} ${t.artist} ${t.description} ${t.category}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  }).sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title))
}

const clampVolume = (v: unknown, fallback: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.min(1, Math.max(0, Math.round(n * 100) / 100)) : fallback
}

/** A stored or posted music choice, or null when absent / unknown track. */
export function parseMusicChoice(raw: unknown): MusicChoice | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const track = findMusicTrack(typeof value.trackId === 'string' ? value.trackId : null)
  if (!track) return null
  return { trackId: track.id, volume: clampVolume(value.volume, 0.5), originalVolume: clampVolume(value.originalVolume, 1) }
}

export function formatTrackLength(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

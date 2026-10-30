import { MIN_SEGMENT_SECONDS, type ClipSegment } from './timeline'

/** A piece of the voice track; muted pieces play silent under the video. Times are clip seconds. */
export type AudioPart = ClipSegment & { muted: boolean }

export const MAX_AUDIO_MUTES = 40
const MIN_MUTE_SECONDS = 0.1

const round = (n: number) => Math.round(n * 100) / 100

/** Clamp, sort and merge muted ranges; [] when nothing is muted. */
export function sanitizeAudioMutes(value: unknown, duration: number): ClipSegment[] {
  if (!Array.isArray(value)) return []
  const parsed = value
    .slice(0, MAX_AUDIO_MUTES)
    .map((raw) => {
      const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
      return { s: Number(r.s), e: Number(r.e) }
    })
    .filter((m) => Number.isFinite(m.s) && Number.isFinite(m.e))
    .map((m) => ({ s: round(Math.max(0, m.s)), e: round(Math.min(duration, m.e)) }))
    .filter((m) => m.e - m.s >= MIN_MUTE_SECONDS)
    .sort((a, b) => a.s - b.s)
  const merged: ClipSegment[] = []
  for (const m of parsed) {
    const last = merged[merged.length - 1]
    if (last && m.s <= last.e) last.e = Math.max(last.e, m.e)
    else merged.push({ ...m })
  }
  return merged
}

export function audioPartsFrom(mutes: ClipSegment[], duration: number): AudioPart[] {
  const end = round(duration)
  const parts: AudioPart[] = []
  let cursor = 0
  for (const m of mutes) {
    if (m.s > cursor) parts.push({ s: cursor, e: m.s, muted: false })
    parts.push({ s: m.s, e: m.e, muted: true })
    cursor = m.e
  }
  if (cursor < end) parts.push({ s: cursor, e: end, muted: false })
  return parts.length ? parts : [{ s: 0, e: end, muted: false }]
}

export function audioMutesFrom(parts: AudioPart[]): ClipSegment[] {
  const mutes: ClipSegment[] = []
  for (const p of parts) {
    if (!p.muted) continue
    const last = mutes[mutes.length - 1]
    if (last && p.s <= last.e) last.e = p.e
    else mutes.push({ s: p.s, e: p.e })
  }
  return mutes
}

function partIndexAt(parts: AudioPart[], t: number): number {
  return parts.findIndex((p) => t >= p.s && t < p.e)
}

/** Splits the voice piece under t; null when t is too close to an edge. */
export function splitAudioAt(parts: AudioPart[], t: number): AudioPart[] | null {
  const i = partIndexAt(parts, t)
  if (i < 0) return null
  const p = parts[i]
  if (t - p.s < MIN_SEGMENT_SECONDS || p.e - t < MIN_SEGMENT_SECONDS) return null
  return [...parts.slice(0, i), { ...p, e: round(t) }, { ...p, s: round(t) }, ...parts.slice(i + 1)]
}

export function toggleAudioMuteAt(parts: AudioPart[], t: number): AudioPart[] | null {
  const i = partIndexAt(parts, t)
  if (i < 0) return null
  return parts.map((p, j) => (j === i ? { ...p, muted: !p.muted } : p))
}

export function isAudioMutedAt(parts: AudioPart[], t: number): boolean {
  return parts[partIndexAt(parts, t)]?.muted ?? false
}

/** Muted ranges clipped to one kept segment (for the per-segment audio filter). */
export function mutesWithin(mutes: ClipSegment[], seg: ClipSegment): ClipSegment[] {
  return mutes
    .map((m) => ({ s: Math.max(m.s, seg.s), e: Math.min(m.e, seg.e) }))
    .filter((m) => m.e - m.s > 0.01)
}

/** ffmpeg `volume` filter silencing the ranges (source timestamps), or '' when none. */
export function muteVolumeFilter(mutes: ClipSegment[]): string {
  if (!mutes.length) return ''
  const expr = mutes.map((m) => `between(t,${m.s.toFixed(3)},${m.e.toFixed(3)})`).join('+')
  return `volume=0:enable='${expr}'`
}

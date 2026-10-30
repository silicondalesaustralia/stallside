/** Final-video speeds offered in the editor (ffmpeg atempo handles 0.5–2 in one pass). */
export const CLIP_SPEED_OPTIONS = [0.75, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2] as const

export type ClipSpeed = (typeof CLIP_SPEED_OPTIONS)[number]

export function parseClipSpeed(value: unknown): ClipSpeed {
  const n = Number(value)
  return CLIP_SPEED_OPTIONS.find((option) => option === n) ?? 1
}

export function clipSpeedLabel(speed: number): string {
  return speed === 1 ? 'Normal (1×)' : `${speed}×`
}

/** Re-time output-time items for a sped-up (or slowed) render. */
export function scaleTimed<T extends { s: number; e: number }>(items: T[], speed: number): T[] {
  if (speed === 1) return items
  const round = (n: number) => Math.round((n / speed) * 1000) / 1000
  return items.map((item) => ({ ...item, s: round(item.s), e: round(item.e) }))
}

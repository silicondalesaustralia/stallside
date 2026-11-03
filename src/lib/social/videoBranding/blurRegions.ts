import type { VideoBlurRegion } from '@/lib/social/videoBranding/types'

export const VIDEO_BLUR_MAX_REGIONS = 20
export const VIDEO_BLUR_MIN_SIZE = 0.03
export const VIDEO_BLUR_MAX_SECONDS = 24 * 60 * 60

const DEFAULT_WIDTH = 0.3
const DEFAULT_HEIGHT = 0.2
const DEFAULT_LENGTH_SECONDS = 5

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function newRegionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `blur-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

export function createBlurRegion(currentTime: number, duration: number): VideoBlurRegion {
  const start = clamp(currentTime, 0, Math.max(0, duration - 0.5))
  return {
    id: newRegionId(),
    x: (1 - DEFAULT_WIDTH) / 2,
    y: (1 - DEFAULT_HEIGHT) / 2,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    start,
    end: Math.min(duration || start + DEFAULT_LENGTH_SECONDS, start + DEFAULT_LENGTH_SECONDS),
  }
}

/** Keeps the box inside the frame and at least the minimum size. */
export function clampBlurGeometry(region: VideoBlurRegion): VideoBlurRegion {
  const width = clamp(region.width, VIDEO_BLUR_MIN_SIZE, 1)
  const height = clamp(region.height, VIDEO_BLUR_MIN_SIZE, 1)
  return {
    ...region,
    width,
    height,
    x: clamp(region.x, 0, 1 - width),
    y: clamp(region.y, 0, 1 - height),
  }
}

export function isBlurActiveAt(region: VideoBlurRegion, time: number): boolean {
  return time >= region.start && time <= region.end
}

export function formatBlurTime(seconds: number): string {
  const safe = Math.max(0, seconds)
  const m = Math.floor(safe / 60)
  const s = safe - m * 60
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

function finiteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function parseOne(raw: unknown): VideoBlurRegion | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const [x, y, width, height, start, end] = [r.x, r.y, r.width, r.height, r.start, r.end].map(
    finiteNumber,
  )
  if (x == null || y == null || width == null || height == null || start == null || end == null) {
    return null
  }
  if (start < 0 || end <= start || end > VIDEO_BLUR_MAX_SECONDS) return null
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x >= 1 || y >= 1) return null
  const id = typeof r.id === 'string' && r.id.trim() ? r.id.trim().slice(0, 64) : newRegionId()
  return clampBlurGeometry({ id, x, y, width, height, start, end })
}

/** Strict parse for API input. */
export function parseBlurRegionsInput(
  raw: unknown,
): { ok: true; regions: VideoBlurRegion[] } | { ok: false; error: string } {
  if (raw == null) return { ok: true, regions: [] }
  if (!Array.isArray(raw)) return { ok: false, error: 'Invalid blur areas' }
  if (raw.length > VIDEO_BLUR_MAX_REGIONS) {
    return { ok: false, error: `Add up to ${VIDEO_BLUR_MAX_REGIONS} blur areas` }
  }
  const regions: VideoBlurRegion[] = []
  for (const item of raw) {
    const parsed = parseOne(item)
    if (!parsed) return { ok: false, error: 'A blur area has an invalid position or time range' }
    regions.push(parsed)
  }
  return { ok: true, regions }
}

/** Lenient parse for stored JSON - drops invalid entries. */
export function blurRegionsFromJson(raw: unknown): VideoBlurRegion[] {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(0, VIDEO_BLUR_MAX_REGIONS)
    .map(parseOne)
    .filter((r): r is VideoBlurRegion => r !== null)
}

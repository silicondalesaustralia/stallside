/**
 * Supabase (free plan) rejects uploads over 50 MB, so every clip encode is sized from its
 * length. The budget sits below 50 MB to absorb x264 overshooting -maxrate (~7%).
 */
const CLIP_BYTE_BUDGET = 42 * 1024 * 1024
const AUDIO_KBPS = 128
const MAX_VIDEO_KBPS = 5000
const MIN_VIDEO_KBPS = 700
/** Below this the picture looks better at 720p than starved at 1080p. */
const FULL_HD_MIN_KBPS = 3000

export function clipVideoKbps(seconds: number): number {
  const budget = (CLIP_BYTE_BUDGET * 8) / 1000 / Math.max(1, seconds) - AUDIO_KBPS
  return Math.round(Math.min(MAX_VIDEO_KBPS, Math.max(MIN_VIDEO_KBPS, budget)))
}

export function clipRateArgs(seconds: number): string[] {
  const kbps = clipVideoKbps(seconds)
  return ['-maxrate', `${kbps}k`, '-bufsize', `${kbps * 2}k`]
}

/** Longest frame edge for a clip of this length: 1080p while the budget allows, else 720p. */
export function clipMaxEdge(seconds: number): number {
  return clipVideoKbps(seconds) < FULL_HD_MIN_KBPS ? 1280 : 1920
}

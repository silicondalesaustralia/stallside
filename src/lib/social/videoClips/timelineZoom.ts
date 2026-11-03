/** Fully zoomed in, the timeline still shows about this many seconds across the view. */
const MIN_VISIBLE_SECONDS = 4

/**
 * Zoom 1 fits the whole video in the view; each step doubles until roughly
 * MIN_VISIBLE_SECONDS fill the screen, so long videos get more steps.
 */
export function timelineZoomLevels(duration: number): number[] {
  const levels = [1]
  while (duration / (levels[levels.length - 1] * 2) >= MIN_VISIBLE_SECONDS && levels.length < 10) {
    levels.push(levels[levels.length - 1] * 2)
  }
  return levels
}

/** Seconds between ruler labels for the seconds visible in the view. */
export function timelineTickStep(visibleSeconds: number): number {
  if (visibleSeconds <= 5) return 0.5
  if (visibleSeconds <= 10) return 1
  if (visibleSeconds <= 20) return 2
  if (visibleSeconds <= 60) return 5
  if (visibleSeconds <= 120) return 10
  if (visibleSeconds <= 300) return 30
  if (visibleSeconds <= 900) return 60
  if (visibleSeconds <= 1800) return 120
  return 300
}

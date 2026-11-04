import { OVERLAY_SIZE_RANGE, OVERLAY_WIDTH_RANGE } from './textOverlays'

/** Snap lines every twelfth of the frame, so thirds, quarters and the centre all line up. */
export const OVERLAY_GRID_DIVISIONS = 12

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

/** Position (0-1) rounded to 3 places, snapped to the nearest grid line when `snap` is on. */
export function overlayPosition(value: number, snap: boolean): number {
  const v = clamp(value, 0, 1)
  const out = snap ? Math.round(v * OVERLAY_GRID_DIVISIONS) / OVERLAY_GRID_DIVISIONS : v
  return Math.round(out * 1000) / 1000
}

/** Text box width (% of frame) from the pointer's distance to the overlay's centre; both 0-1 across. */
export function overlayWidthFromPointer(pointerX: number, centreX: number, snap: boolean): number {
  const raw = Math.abs(pointerX - centreX) * 200
  const stepped = snap ? Math.round(raw / 5) * 5 : Math.round(raw)
  return clamp(stepped, OVERLAY_WIDTH_RANGE.min, OVERLAY_WIDTH_RANGE.max)
}

/** Font size scaled by how far the corner handle moved from the centre compared with where the drag began. */
export function overlaySizeFromDrag(startSize: number, startDistance: number, distance: number): number {
  if (startDistance <= 0) return startSize
  const scaled = startSize * (distance / startDistance)
  return clamp(Math.round(scaled * 2) / 2, OVERLAY_SIZE_RANGE.min, OVERLAY_SIZE_RANGE.max)
}

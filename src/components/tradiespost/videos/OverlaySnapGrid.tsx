'use client'

import { OVERLAY_GRID_DIVISIONS } from '@/lib/social/videoClips/overlayLayout'

const LINES = Array.from({ length: OVERLAY_GRID_DIVISIONS - 1 }, (_, i) => (i + 1) / OVERLAY_GRID_DIVISIONS)

/** Snap guides over the preview while text is dragged; thirds and centre are brighter. */
export function OverlaySnapGrid() {
  const strong = (p: number) => [1 / 3, 1 / 2, 2 / 3].some((k) => Math.abs(k - p) < 0.001)
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {LINES.map((p) => (
        <span key={`v${p}`} className={`absolute inset-y-0 w-px ${strong(p) ? 'bg-white/50' : 'bg-white/20'}`} style={{ left: `${p * 100}%` }} />
      ))}
      {LINES.map((p) => (
        <span key={`h${p}`} className={`absolute inset-x-0 h-px ${strong(p) ? 'bg-white/50' : 'bg-white/20'}`} style={{ top: `${p * 100}%` }} />
      ))}
    </div>
  )
}

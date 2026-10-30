'use client'

import { CaptionCueList } from './CaptionCueList'
import { CaptionStylePanel } from './CaptionStylePanel'
import { ClipSpeedField } from './ClipSpeedField'
import { TextOverlayPanel } from './TextOverlayPanel'
import type { useClipEditor } from './useClipEditor'

type Props = { ed: ReturnType<typeof useClipEditor> }

/** Settings beside the preview: selected text overlay, speed, caption style and caption list. */
export function ClipEditorSidebar({ ed }: Props) {
  const { busy, selectedOverlay } = ed
  return (
    <aside className="min-w-0 space-y-4 lg:max-h-[74vh] lg:overflow-y-auto lg:pr-1">
      {ed.rendering ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">This clip is updating — you can edit again once that finishes.</p>
      ) : null}
      {selectedOverlay ? (
        <TextOverlayPanel
          overlay={selectedOverlay}
          disabled={busy}
          onChange={(patch) => ed.updateOverlay(selectedOverlay.id, patch)}
          onRemove={() => ed.removeOverlay(selectedOverlay.id)}
          onClose={() => ed.setSelectedOverlayId(null)}
        />
      ) : null}
      <ClipSpeedField value={ed.speed} disabled={busy} onChange={ed.setSpeed} />
      <CaptionStylePanel value={ed.settings} disabled={busy} onChange={ed.setSettings} />
      <div className="max-h-[30vh] overflow-y-auto pr-1">
        <CaptionCueList cues={ed.cues} activeIndex={ed.activeIndex} disabled={busy} onChange={ed.setCues} onSeek={ed.seek} />
      </div>
    </aside>
  )
}

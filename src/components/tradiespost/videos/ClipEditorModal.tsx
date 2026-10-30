'use client'

import { Loader2, X } from 'lucide-react'
import { outputDuration } from '@/lib/social/videoClips/timeline'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import { CaptionPreviewVideo } from './CaptionPreviewVideo'
import { ClipEditorSidebar } from './ClipEditorSidebar'
import { ClipEditorToolbar } from './ClipEditorToolbar'
import { ClipTimeline } from './ClipTimeline'
import { OverlayPreviewLayer } from './OverlayPreviewLayer'
import { useClipEditor } from './useClipEditor'
import { SocialFontPreviewStyles } from '@/components/social/SocialFontPreviewStyles'

type Props = { clipId: string; clipTitle: string; onClose: () => void; onSaved: () => void }

export function ClipEditorModal({ clipId, clipTitle, onClose, onSaved }: Props) {
  const ed = useClipEditor(clipId)
  const { settings, busy } = ed
  const activeCue = ed.activeIndex >= 0 ? ed.cues[ed.activeIndex] : null

  async function handleSave() {
    if (!(await ed.save())) return
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="clip-editor-title">
      <SocialFontPreviewStyles />
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-tradiespost-border px-4 py-3">
          <h2 id="clip-editor-title" className="truncate text-base font-black text-black">Edit clip — {clipTitle}</h2>
          <button type="button" onClick={onClose} disabled={ed.saving} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {ed.loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
        ) : (
          <div className="grid gap-4 overflow-y-auto px-4 py-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-3">
              <CaptionPreviewVideo
                src={ed.previewUrl}
                videoRef={ed.videoRef}
                text={activeCue ? activeCue.text : null}
                progress={activeCue ? (ed.time - activeCue.s) / Math.max(0.01, activeCue.e - activeCue.s) : 0}
                settings={settings}
                onTime={ed.onTime}
                onPlayState={ed.setPlaying}
              >
                <OverlayPreviewLayer
                  overlays={ed.overlays}
                  time={ed.time}
                  selectedId={ed.selectedOverlay?.id ?? null}
                  disabled={busy}
                  onSelect={ed.setSelectedOverlayId}
                  onMove={(id, x, y) => ed.updateOverlay(id, { x, y })}
                />
              </CaptionPreviewVideo>
              <ClipTimeline
                duration={ed.duration}
                time={ed.time}
                playing={ed.playing}
                segments={ed.segments}
                cues={ed.cues}
                activeIndex={ed.activeIndex}
                disabled={busy}
                onSeek={ed.seek}
                onTogglePlay={ed.togglePlay}
                onCues={ed.setCues}
                audioParts={ed.audioParts}
                onAudioParts={ed.setAudioParts}
                overlays={ed.overlays}
                selectedOverlayId={ed.selectedOverlay?.id ?? null}
                onOverlays={ed.setOverlays}
                onSelectOverlay={ed.setSelectedOverlayId}
              />
              <ClipEditorToolbar
                time={ed.time}
                duration={ed.duration}
                segments={ed.segments}
                cues={ed.cues}
                activeIndex={ed.activeIndex}
                disabled={busy}
                onSegments={ed.setSegments}
                onCues={ed.setCues}
                audioParts={ed.audioParts}
                onAudioParts={ed.setAudioParts}
                onAddText={ed.addOverlay}
              />
              <p className="text-xs text-zinc-500">
                Final length {formatVideoDuration(outputDuration(ed.segments) / ed.speed)}{ed.speed !== 1 ? ` at ${ed.speed}×` : ''}. Dark blocks are kept; striped areas are cut. Green is the voice — mute any section. Drag captions (yellow) and text (blue) to retime them.
              </p>
            </div>
            <ClipEditorSidebar ed={ed} />
          </div>
        )}
        <div className="border-t border-tradiespost-border px-4 py-3">
          <button type="button" onClick={() => void handleSave()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-tradiespost-gold py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50">
            {ed.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save &amp; update clip
          </button>
        </div>
      </div>
    </div>
  )
}

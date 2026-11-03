'use client'

import { Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { VideoBrandingPanel } from '@/components/social/VideoBrandingPanel'
import { ClipEditorSidebar } from '@/components/tradiespost/videos/ClipEditorSidebar'
import { ClipEditorToolbar } from '@/components/tradiespost/videos/ClipEditorToolbar'
import { ClipTimeline } from '@/components/tradiespost/videos/ClipTimeline'
import { useClipEditor } from '@/components/tradiespost/videos/useClipEditor'
import { formatVideoDuration } from '@/lib/social/libraryMediaViewModel'
import type { VideoHeadlineBusinessDefaults } from '@/lib/social/videoBranding/headlineStyle'
import type { VideoBrandingConfig } from '@/lib/social/videoBranding/types'
import { outputDuration } from '@/lib/social/videoClips/timeline'
import { LibraryBlurTrackRows } from './LibraryBlurTrackRows'
import { LibraryEditorPreview } from './LibraryEditorPreview'
import { LibraryEditorTools } from './LibraryEditorTools'
import { useLibraryBlur } from './useLibraryBlur'
import { useLibraryCaptions } from './useLibraryCaptions'
import { useLibraryEditLoader } from './useLibraryEditLoader'
import { useVideoElementDimensions } from './useVideoElementDimensions'

type Props = {
  assetId: string
  title: string
  brandingConfig: VideoBrandingConfig | null
  businessDefaults?: VideoHeadlineBusinessDefaults
  suggestContext: { aboutText?: string | null; jobTitle?: string | null; jobSuburb?: string | null }
  processing: boolean
  /** Saves edits + branding and queues the render (POST /process). */
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

/** Full editor for a Library upload: clip editor tools plus blur, logo and headline. */
export function LibraryVideoEditorModal({ assetId, title, brandingConfig, businessDefaults, suggestContext, processing, onSubmit, onClose }: Props) {
  const blur = useLibraryBlur(brandingConfig?.blurRegions ?? [])
  const loader = useLibraryEditLoader()
  const ed = useClipEditor(assetId, loader.load)
  const captions = useLibraryCaptions(assetId, loader.status, loader.setStatus, ed.setCues)
  const dims = useVideoElementDimensions(ed.videoRef, ed.previewUrl)
  const busy = ed.busy || processing

  async function handleSubmit(payload: Record<string, unknown>) {
    await onSubmit({ ...payload, blurRegions: blur.regions, edit: ed.edit })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="library-editor-title">
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-tradiespost-border px-4 py-3">
          <h2 id="library-editor-title" className="truncate text-base font-black text-black">Edit video — {title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {ed.loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
        ) : ed.duration <= 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">This video is missing its length, so it can&apos;t be edited. Try uploading it again.</p>
        ) : (
          <div className="grid gap-4 overflow-y-auto px-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-3">
              <LibraryEditorPreview ed={ed} blur={blur} disabled={busy} />
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
              >
                <LibraryBlurTrackRows
                  regions={blur.regions}
                  selectedId={blur.selectedId}
                  duration={ed.duration}
                  disabled={busy}
                  onChange={blur.update}
                  onRemove={blur.remove}
                  onSelect={(id, seekTo) => {
                    blur.setSelectedId(id)
                    ed.seek(seekTo)
                  }}
                />
              </ClipTimeline>
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
              >
                <LibraryEditorTools
                  disabled={busy}
                  canAddBlur={blur.canAdd}
                  onAddBlur={() => blur.add(ed.time, ed.duration)}
                  canFillBlur={blur.hasSelection}
                  onFillBlur={() => blur.fillSelected(ed.duration)}
                  hasTranscript={captions.hasTranscript}
                  transcribing={captions.transcribing}
                  startingCaptions={captions.starting}
                  onGenerateCaptions={() => void captions.start()}
                />
              </ClipEditorToolbar>
              <p className="text-xs text-zinc-500">
                Final length {formatVideoDuration(outputDuration(ed.segments) / ed.speed)}{ed.speed !== 1 ? ` at ${ed.speed}×` : ''}. Dark blocks are kept; striped areas are cut. Drag captions (yellow), text (blue) and blur (purple) bars to retime them; drag blur boxes on the video to place them.
              </p>
            </div>
            <ClipEditorSidebar ed={ed}>
              <VideoBrandingPanel
                assetId={assetId}
                initialConfig={brandingConfig}
                businessDefaults={businessDefaults}
                suggestContext={suggestContext}
                processing={processing}
                submitLabel="Save & export video"
                videoDimensions={dims}
                onSubmit={handleSubmit}
              />
            </ClipEditorSidebar>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

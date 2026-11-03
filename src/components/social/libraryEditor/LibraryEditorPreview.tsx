'use client'

import { CaptionPreviewVideo } from '@/components/tradiespost/videos/CaptionPreviewVideo'
import { OverlayPreviewLayer } from '@/components/tradiespost/videos/OverlayPreviewLayer'
import type { useClipEditor } from '@/components/tradiespost/videos/useClipEditor'
import { LibraryBlurLayer } from './LibraryBlurLayer'
import type { useLibraryBlur } from './useLibraryBlur'

type Props = {
  ed: ReturnType<typeof useClipEditor>
  blur: ReturnType<typeof useLibraryBlur>
  disabled: boolean
}

/** Video preview with live captions, draggable blur boxes and text overlays. */
export function LibraryEditorPreview({ ed, blur, disabled }: Props) {
  const activeCue = ed.activeIndex >= 0 ? ed.cues[ed.activeIndex] : null
  return (
    <CaptionPreviewVideo
      src={ed.previewUrl}
      videoRef={ed.videoRef}
      text={activeCue ? activeCue.text : null}
      progress={activeCue ? (ed.time - activeCue.s) / Math.max(0.01, activeCue.e - activeCue.s) : 0}
      settings={ed.settings}
      onTime={ed.onTime}
      onPlayState={ed.setPlaying}
    >
      <LibraryBlurLayer
        regions={blur.regions}
        selectedId={blur.selectedId}
        time={ed.time}
        disabled={disabled}
        onSelect={blur.setSelectedId}
        onChange={blur.update}
      />
      <OverlayPreviewLayer
        overlays={ed.overlays}
        time={ed.time}
        selectedId={ed.selectedOverlay?.id ?? null}
        disabled={disabled}
        onSelect={ed.setSelectedOverlayId}
        onMove={(id, x, y) => ed.updateOverlay(id, { x, y })}
      />
    </CaptionPreviewVideo>
  )
}

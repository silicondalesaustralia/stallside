'use client'

import { useState, type ReactNode, type RefObject } from 'react'
import { FALLBACK_HIGHLIGHT_COLOR, type CaptionSettings } from '@/lib/social/videoClips/captionStyles'
import { captionPlacementClass, captionPreviewCss, highlightedWordIndex } from './captionPreviewCss'

type Props = {
  src: string | null
  videoRef: RefObject<HTMLVideoElement | null>
  text: string | null
  /** 0–1 through the current caption, for the word highlight. */
  progress: number
  settings: CaptionSettings
  onTime: (seconds: number) => void
  onPlayState?: (playing: boolean) => void
  /** Drawn over the video frame (same box as the picture, so 0–1 coords match the render). */
  children?: ReactNode
}

/** Live preview of the caption styling; the final burn-in comes from the server render. */
export function CaptionPreviewVideo({ src, videoRef, text, progress, settings, onTime, onPlayState, children }: Props) {
  const [aspect, setAspect] = useState(9 / 16)
  const showText = text && settings.style !== 'none'
  const highlightIndex = showText && settings.wordHighlight ? highlightedWordIndex(text, progress) : -1
  const highlightColor = settings.highlightColor ?? FALLBACK_HIGHLIGHT_COLOR

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-xl bg-black"
      style={{ aspectRatio: String(aspect), width: `min(100%, calc(42vh * ${aspect}))`, containerType: 'size' }}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onLoadedMetadata={(e) => {
            const { videoWidth, videoHeight } = e.currentTarget
            if (videoWidth > 0 && videoHeight > 0) setAspect(videoWidth / videoHeight)
          }}
          onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
          onPlay={() => onPlayState?.(true)}
          onPause={() => onPlayState?.(false)}
          onEnded={() => onPlayState?.(false)}
        />
      ) : null}
      {showText ? (
        <div className={`pointer-events-none absolute inset-x-[8%] ${captionPlacementClass(settings)} text-center`}>
          <span style={captionPreviewCss(settings)}>
            {highlightIndex < 0
              ? text
              : text
                  .trim()
                  .split(/\s+/)
                  .map((word, i) => (
                    <span key={i} style={i === highlightIndex ? { color: highlightColor } : undefined}>
                      {i > 0 ? ' ' : ''}
                      {word}
                    </span>
                  ))}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { ImageLightbox } from '@/components/ui/ImageLightbox'

/** Thumbnail that opens a full-size lightbox on click. */
export function ClickToExpandImage({
  src,
  expandSrc,
  alt = '',
  className = '',
  imageClassName = 'h-full w-full object-cover',
}: {
  src:             string
  expandSrc?:      string
  alt?:            string
  className?:      string
  imageClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const fullSrc = expandSrc ?? src

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block cursor-zoom-in overflow-hidden ${className}`}
        aria-label={`View full size: ${alt || 'image'}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imageClassName} />
      </button>
      <ImageLightbox
        open={open}
        src={fullSrc}
        alt={alt}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

/** Zoom control for thumbnails that already have a primary click action (e.g. select). */
export function ImageExpandTrigger({
  src,
  expandSrc,
  alt = '',
  className = 'absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70',
}: {
  src:        string
  expandSrc?: string
  alt?:       string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const fullSrc = expandSrc ?? src

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className={className}
        aria-label={`View full size: ${alt || 'image'}`}
      >
        <Maximize2 className="h-3 w-3" />
      </button>
      <ImageLightbox
        open={open}
        src={fullSrc}
        alt={alt}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

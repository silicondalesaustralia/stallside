'use client'

import { useCallback, useState } from 'react'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SlideshowRenderResult } from '@/lib/social/slideshow/slideshowTypes'
import { useSlideshowImages } from '@/components/social/slideshow/useSlideshowImages'
import { useSlideshowBuild, type SlideshowVideo } from '@/components/social/slideshow/useSlideshowBuild'
import { SlideshowSelectedTray } from '@/components/social/slideshow/SlideshowSelectedTray'
import { SlideshowImageSources } from '@/components/social/slideshow/SlideshowImageSources'
import { SlideshowWriteForm } from '@/components/social/slideshow/SlideshowWriteForm'
import { SlideshowEditor } from '@/components/social/slideshow/SlideshowEditor'
import { SlideshowDone } from '@/components/social/slideshow/SlideshowDone'
import { slideshowVideoMedia } from '@/components/social/slideshow/slideshowMedia'

type Props = {
  jobId: string | null
  linkedImages: string[]
  business: { name: string | null; brand_color: string | null } | null
  tiktokSelected: boolean
  onMedia: (media: ComposerMedia) => void
  onSuggestedCaption: (caption: string) => void
}

/** Pick images -> AI writes a slide per image -> edit -> 9:16 MP4 for every platform. */
export function ComposerSlideshow({ jobId, linkedImages, business, tiktokSelected, onMedia, onSuggestedCaption }: Props) {
  const picker = useSlideshowImages()
  const [context, setContext] = useState('')
  const [result, setResult] = useState<{ video: SlideshowVideo; rendered: SlideshowRenderResult } | null>(null)

  const onVideo = useCallback(
    (video: SlideshowVideo, rendered: SlideshowRenderResult) => {
      setResult({ video, rendered })
      onMedia(slideshowVideoMedia(video, rendered))
    },
    [onMedia],
  )
  const build = useSlideshowBuild({ jobId, onVideo })

  if (build.phase === 'done' && result) {
    return (
      <SlideshowDone
        video={result.video}
        rendered={result.rendered}
        tiktokSelected={tiktokSelected}
        onMedia={onMedia}
        onStartOver={() => {
          setResult(null)
          build.reset()
        }}
      />
    )
  }

  if (build.phase === 'edit' || build.phase === 'creating') {
    return (
      <SlideshowEditor
        slides={build.slides}
        businessName={business?.name?.trim() || 'Our team'}
        brandColor={business?.brand_color ?? null}
        creating={build.phase === 'creating'}
        error={build.error}
        secondsPerSlide={build.secondsPerSlide}
        transition={build.transition}
        onSeconds={build.setSecondsPerSlide}
        onTransition={build.setTransition}
        onChange={build.updateSlide}
        onBack={() => build.setPhase('pick')}
        onCreate={() => {
          if (build.caption) onSuggestedCaption(build.caption)
          void build.create()
        }}
      />
    )
  }

  return (
    <div className="space-y-4" data-testid="composer-slideshow">
      <SlideshowSelectedTray images={picker.images} onMove={picker.move} onRemove={picker.remove} />
      <SlideshowImageSources
        selected={picker.images}
        linkedImages={linkedImages}
        uploading={picker.uploading}
        error={picker.error}
        onToggle={picker.toggle}
        onUpload={(files) => void picker.upload(files)}
      />
      <SlideshowWriteForm
        context={context}
        imageCount={picker.images.length}
        writing={build.phase === 'writing'}
        error={build.error}
        onContext={setContext}
        onWrite={() => void build.write(picker.images, context)}
      />
    </div>
  )
}

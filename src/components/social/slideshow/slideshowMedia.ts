import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SlideshowRenderResult } from '@/lib/social/slideshow/slideshowTypes'
import type { SlideshowVideo } from '@/components/social/slideshow/useSlideshowBuild'

export function slideshowVideoMedia(video: SlideshowVideo, rendered: SlideshowRenderResult): ComposerMedia {
  return {
    url: video.thumbnailUrl || rendered.slideUrls[0],
    renderId: null,
    aiGenerated: false,
    video: { url: video.url, durationSeconds: video.durationSeconds, silent: true },
    assetId: video.assetId,
  }
}

/** TikTok gets every slide as a photo post; other platforms get the 4:5 cover. */
export function slideshowPhotoMedia(rendered: SlideshowRenderResult): ComposerMedia {
  return { url: rendered.coverUrl, renderId: null, aiGenerated: false, slides: rendered.slideUrls, slidesKind: 'ai' }
}

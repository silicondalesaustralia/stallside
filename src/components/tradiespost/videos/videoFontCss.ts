import { socialFontStack } from '@/lib/social/socialFontWebPreview'
import type { VideoHeadlineFontId } from '@/lib/social/videoBranding/types'
import { videoHeadlineFontEntry } from '@/lib/social/videoBranding/videoHeadlineFontCatalog'

/** CSS font-family for a worker video font (faces come from SocialFontPreviewStyles). */
export function videoFontCss(fontId: VideoHeadlineFontId): string {
  return socialFontStack(videoHeadlineFontEntry(fontId).label)
}

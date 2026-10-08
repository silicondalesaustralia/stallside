import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { VideoHeadlineFontId, VideoHeadlineWeight } from '@/lib/social/videoBranding/types'
import {
  videoHeadlineFontEntry,
  videoHeadlineFontFile,
} from '@/lib/social/videoBranding/videoHeadlineFontCatalog'

export {
  VIDEO_HEADLINE_FONTS,
  VIDEO_HEADLINE_EXCLUDED_SOCIAL_FONTS,
  isVideoHeadlineFontId,
  videoHeadlineFontFromSocialFamily,
  videoHeadlineFontLabel,
} from '@/lib/social/videoBranding/videoHeadlineFontCatalog'

export function workerFontsRoot(): string {
  if (process.env.VIDEO_FONTS_ROOT?.trim()) {
    return process.env.VIDEO_FONTS_ROOT.trim()
  }
  return join(process.cwd(), 'src/lib/social/fonts')
}

export function resolveVideoHeadlineFontPath(
  fontId: VideoHeadlineFontId,
  weight: VideoHeadlineWeight,
): string {
  const entry = videoHeadlineFontEntry(fontId)
  const root = workerFontsRoot()
  const preferred = join(root, videoHeadlineFontFile(fontId, weight))
  if (existsSync(preferred)) return preferred
  const regularPath = join(root, entry.regularFile)
  if (existsSync(regularPath)) return regularPath
  const dejavu = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
  if (existsSync(dejavu)) return dejavu
  return preferred
}

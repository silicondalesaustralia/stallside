import type { SupabaseClient } from '@supabase/supabase-js'
import { planLibraryEdit, type LibraryEditGraph } from '../../../src/lib/social/videoBranding/libraryEditPlan'
import type { VideoBlurRegion } from '../../../src/lib/social/videoBranding/types'
import { workerFontsRoot } from '../../../src/lib/social/videoBranding/videoHeadlineFonts'
import { fetchBrandColor, writeClipAss } from './captionRender'

export type PreparedLibraryEdit = {
  edit: (LibraryEditGraph & { hasAudio: boolean }) | null
  blurRegions: VideoBlurRegion[]
  assPath: string | null
  fontsDir: string | null
  outputSeconds: number
}

/** Turns the Library editor's stored edits into ffmpeg plan inputs for one branding render. */
export async function prepareLibraryEdit(input: {
  db: SupabaseClient
  businessId: string
  captions: unknown
  blurRegions: VideoBlurRegion[]
  durationSeconds: number
  hasAudio: boolean
  outWidth: number
  outHeight: number
  workDir: string
}): Promise<PreparedLibraryEdit> {
  const plan = planLibraryEdit(input.captions, input.blurRegions, input.durationSeconds, input.hasAudio)
  const brandColor = await fetchBrandColor(input.db, input.businessId)
  const assPath = await writeClipAss({
    captions: plan.burned,
    brandColor,
    width: input.outWidth,
    height: input.outHeight,
    workDir: input.workDir,
  })
  return {
    edit: plan.edit ? { ...plan.edit, hasAudio: input.hasAudio } : null,
    blurRegions: plan.blurRegions,
    assPath,
    fontsDir: assPath ? workerFontsRoot() : null,
    outputSeconds: plan.outputSeconds,
  }
}

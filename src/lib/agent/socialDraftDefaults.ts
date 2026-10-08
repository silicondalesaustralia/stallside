import type { SocialDraftContent } from '@/lib/agent/types'
import {
  composeDefaultsForSubtype,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import { DEFAULT_POST_SUBTYPE_ID, isPostSubtypeId } from '@/lib/social/postTaxonomy'

export type SocialDraftRenderPlan = {
  format: ContentFormat
  photoSource: PhotoSource
  infographicPreset: InfographicPreset
  photoUrl: string | null
}

const FALLBACK_INFOGRAPHIC_PRESET: InfographicPreset = 'process_steps'

/** Infographic fallback when scene + ai_generate fails on approve. */
export function socialDraftInfographicFallbackPlan(): SocialDraftRenderPlan {
  return {
    format: 'infographic',
    photoSource: 'none',
    infographicPreset: FALLBACK_INFOGRAPHIC_PRESET,
    photoUrl: null,
  }
}

/**
 * Resolve format / photo_source for survey drafts and legacy pending rows.
 * Never returns scene + job or scene + none when there is no job photo.
 */
export function resolveSocialDraftRenderPlan(draft: SocialDraftContent): SocialDraftRenderPlan {
  const subtypeId =
    draft.subtype_id && isPostSubtypeId(draft.subtype_id)
      ? draft.subtype_id
      : DEFAULT_POST_SUBTYPE_ID
  const taxonomyDefaults = composeDefaultsForSubtype(subtypeId)
  const hasPhoto = Boolean(draft.photo_url?.trim())

  let format: ContentFormat = draft.format ?? taxonomyDefaults.format
  let photoSource: PhotoSource = draft.photo_source ?? taxonomyDefaults.photoSource
  let infographicPreset: InfographicPreset =
    draft.infographic_preset ?? taxonomyDefaults.infographicPreset

  if (hasPhoto) {
    format = 'scene'
    photoSource = 'job'
  } else {
    if (format === 'scene' && (photoSource === 'job' || photoSource === 'none')) {
      format = 'scene'
      photoSource = 'ai_generate'
    }
  }

  return {
    format,
    photoSource,
    infographicPreset,
    photoUrl: hasPhoto ? draft.photo_url!.trim() : null,
  }
}

/** Survey-time defaults when inserting a new social_post draft. */
export function buildSocialSurveyDraftFields(
  hasPhoto: boolean,
  photoUrl: string | null,
  subtypeId: typeof DEFAULT_POST_SUBTYPE_ID = DEFAULT_POST_SUBTYPE_ID,
): Pick<SocialDraftContent, 'format' | 'photo_source' | 'infographic_preset' | 'photo_url'> {
  const taxonomyDefaults = composeDefaultsForSubtype(subtypeId)
  if (hasPhoto && photoUrl) {
    return {
      format: 'scene',
      photo_source: 'job',
      infographic_preset: taxonomyDefaults.infographicPreset,
      photo_url: photoUrl,
    }
  }
  return {
    format: 'scene',
    photo_source: 'ai_generate',
    infographic_preset: taxonomyDefaults.infographicPreset,
    photo_url: null,
  }
}

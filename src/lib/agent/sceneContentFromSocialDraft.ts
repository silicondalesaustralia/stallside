import {
  defaultSceneCta,
  SCENE_HEADLINE_MAX,
  SCENE_TAGLINE_MAX,
  type SceneContent,
} from '@/lib/social/sceneContent'
import type { SocialDraftContent } from '@/lib/agent/types'

function truncate(s: string, max: number): string {
  const t = s.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

/** Map week-ahead social draft → scene hybrid-render content. */
export function sceneContentFromSocialDraft(
  draft: SocialDraftContent,
  business: {
    name?: string | null
    phone?: string | null
    social_default_cta?: string | null
  },
): SceneContent {
  const headline = truncate(
    draft.job_title?.trim() || business.name?.trim() || 'Job complete',
    SCENE_HEADLINE_MAX,
  )
  const tagline = truncate(
    draft.caption?.trim() || `Recently completed in ${draft.suburb || 'your area'}.`,
    SCENE_TAGLINE_MAX,
  )
  return {
    headline,
    tagline,
    cta: defaultSceneCta(business),
  }
}

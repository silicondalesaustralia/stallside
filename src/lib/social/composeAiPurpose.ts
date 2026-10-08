/**
 * Maps Step 1 post subtypes → AI image purpose (4-value enum).
 * Explicit per-subtype mapping lives on postTaxonomy entries - no runtime heuristics.
 */

import {
  AI_IMAGE_PURPOSES,
  type AiImagePurpose,
} from '@/lib/social/aiImageStyles'
import {
  getPostSubtypeDefinition,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'

const PURPOSE_LABEL_BY_ID = new Map(
  AI_IMAGE_PURPOSES.map((p) => [p.id, p.label]),
)

export function aiPurposeForSubtype(subtypeId: PostSubtypeId): AiImagePurpose {
  return getPostSubtypeDefinition(subtypeId).aiPurpose
}

export function aiPurposeLabel(purpose: AiImagePurpose): string {
  return PURPOSE_LABEL_BY_ID.get(purpose) ?? purpose
}

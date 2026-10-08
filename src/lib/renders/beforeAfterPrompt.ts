import type { BeforeAfterStyle } from '@/lib/renders/beforeAfterOptions'
import {
  buildRenderChangePromptFragments,
  getTradeSceneContext,
  type RenderTradeId,
} from '@/lib/renders/tradeRenderOptions'

/** Default OpenAI edit model - override via OPENAI_EDIT_IMAGE_MODEL env. */
export const DEFAULT_OPENAI_EDIT_IMAGE_MODEL = 'gpt-image-1'

const STYLE_FRAGMENTS: Record<BeforeAfterStyle, string> = {
  modern:
    'modern contemporary design with clean lines and current finishes',
  farmhouse:
    'warm farmhouse style with rustic textures and inviting tones',
  minimalist:
    'minimalist design with uncluttered surfaces and restrained detailing',
  luxury:
    'luxury high-end finishes with premium materials and refined detailing',
  industrial:
    'industrial loft aesthetic with practical materials and bold contrast',
}

/**
 * Server-side prompt for images.edit - trade-aware change fragments + style.
 * Emphasises in-place editing so the result stays recognisably the same scene.
 */
export function buildBeforeAfterPrompt(
  changeIds: string[],
  style: BeforeAfterStyle,
  tradeId: RenderTradeId,
  customChangeDescription?: string | null,
): string {
  const fragments = buildRenderChangePromptFragments(tradeId, changeIds, customChangeDescription)
  const changeList = fragments.join('; ')

  return [
    getTradeSceneContext(tradeId),
    'Do not replace the scene with a different location or unrelated view.',
    changeList ? `Apply these changes: ${changeList}.` : 'Apply a professional finished upgrade appropriate to the trade work shown.',
    `Overall design direction: ${STYLE_FRAGMENTS[style]}.`,
    'Photorealistic result, natural lighting, no text, logos, or watermarks.',
  ].join(' ')
}

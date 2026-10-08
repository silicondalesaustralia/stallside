/**
 * AI Designed (Start from scratch) - isolated from Recreate and gpt-image-1 photo flows.
 * Does NOT read OPENAI_IMAGE_MODEL.
 */

export const DEFAULT_OPENAI_AI_DESIGNED_IMAGE_MODEL = 'gpt-image-2'

export const AI_DESIGNED_VISUAL_PATH = 'ai_designed' as const

export type ScratchCreateMode = 'ai_designed' | 'build_layout'

type EnvLike = Record<string, string | undefined>

const AI_DESIGNED_FLAG = 'AI_DESIGNED_ENABLED'

/**
 * Opt-in Start from scratch → AI Designed chooser.
 * Default false - today's builder stays the only scratch surface until enabled.
 * Read via a computed key so Next/webpack cannot inline this as undefined at build time.
 */
export function isAiDesignedEnabled(env: EnvLike = process.env): boolean {
  const raw = env[AI_DESIGNED_FLAG]
  return typeof raw === 'string' && raw.trim() === 'true'
}

/**
 * Model for images.generate() only.
 * 1. OPENAI_AI_DESIGNED_IMAGE_MODEL
 * 2. OPENAI_RECREATE_IMAGE_MODEL
 * 3. gpt-image-2
 */
export function resolveOpenAiAiDesignedImageModel(env: EnvLike = process.env): string {
  const designed = env.OPENAI_AI_DESIGNED_IMAGE_MODEL?.trim()
  if (designed) return designed
  const recreate = env.OPENAI_RECREATE_IMAGE_MODEL?.trim()
  if (recreate) return recreate
  return DEFAULT_OPENAI_AI_DESIGNED_IMAGE_MODEL
}

export function defaultScratchCreateMode(): ScratchCreateMode {
  return 'ai_designed'
}

/** Flag off → builder only. Flag on → chooser, AI Designed default. */
export function resolveScratchCreateSurface(
  enabled: boolean,
  mode: ScratchCreateMode = defaultScratchCreateMode(),
): {
  showChooser: boolean
  showAiDesigned: boolean
  showBuilder: boolean
  defaultMode: ScratchCreateMode
} {
  if (!enabled) {
    return {
      showChooser: false,
      showAiDesigned: false,
      showBuilder: true,
      defaultMode: 'ai_designed',
    }
  }
  return {
    showChooser: true,
    showAiDesigned: mode === 'ai_designed',
    showBuilder: mode === 'build_layout',
    defaultMode: 'ai_designed',
  }
}

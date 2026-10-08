/**
 * Recreate-from-inspiration image path - isolated from ordinary photo generation.
 * Does NOT read OPENAI_IMAGE_MODEL (cleanup / before-after / Create photo).
 */

/** Default Recreate image model - override via OPENAI_RECREATE_IMAGE_MODEL. */
export const DEFAULT_OPENAI_RECREATE_IMAGE_MODEL = 'gpt-image-2'

type EnvLike = Record<string, string | undefined>

export function resolveOpenAiRecreateImageModel(
  env: EnvLike = process.env,
): string {
  const override = env.OPENAI_RECREATE_IMAGE_MODEL?.trim()
  return override || DEFAULT_OPENAI_RECREATE_IMAGE_MODEL
}

const RECREATE_REFERENCE_FLAG = 'RECREATE_REFERENCE_IMAGE_ENABLED'

/**
 * Opt-in Recreate reference-image path.
 * Default false - existing Recreate template pipeline stays live until enabled.
 * Read via a computed key so Next/webpack cannot inline this as undefined at build time.
 */
export function isRecreateReferenceImageEnabled(
  env: EnvLike = process.env,
): boolean {
  const raw = env[RECREATE_REFERENCE_FLAG]
  return typeof raw === 'string' && raw.trim() === 'true'
}

export type RecreateVisualPath = 'reference_recreation' | 'legacy_template'

export function shouldRetainInspirationTemp(params: {
  analysisOk: boolean
  referencePathEnabled: boolean
  hasTempPath: boolean
}): boolean {
  return params.analysisOk && params.referencePathEnabled && params.hasTempPath
}

export function resolveRecreateVisualPath(params: {
  referencePathEnabled: boolean
  hasReferenceBuffer: boolean
}): RecreateVisualPath {
  if (params.referencePathEnabled && params.hasReferenceBuffer) {
    return 'reference_recreation'
  }
  return 'legacy_template'
}

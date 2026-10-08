import { AI_DESIGNED_VISUAL_PATH } from '@/lib/social/aiDesignedConfig'
import { designedVisualAuditMeta, parseDesignedVisualInputs } from '@/lib/social/designedVisualInputs'

/** Stored on hybrid_social_renders.content._designed. */
export type DesignedSavedMeta = {
  generationMode: 'ai_designed'
  generationSource: 'ai_designed_scratch'
  visualPath: typeof AI_DESIGNED_VISUAL_PATH
  messageAngle?: string | null
  userBrief?: string | null
  intentChip?: string | null
  jobId?: string | null
  logoAssetId?: string | null
  logoVariantType?: string | null
  logoDisabled?: boolean
  logoPosition?: string | null
  logoSize?: string | null
  imageModel?: string | null
  visualInputs?: unknown
}

export function buildDesignedLibraryMeta(
  input: Partial<DesignedSavedMeta> & {
    messageAngle?: string | null
  },
): DesignedSavedMeta {
  return {
    generationMode: 'ai_designed',
    generationSource: 'ai_designed_scratch',
    visualPath: AI_DESIGNED_VISUAL_PATH,
    messageAngle: input.messageAngle ?? null,
    userBrief: input.userBrief ?? null,
    intentChip: input.intentChip ?? null,
    jobId: input.jobId ?? null,
    logoAssetId: input.logoAssetId ?? null,
    logoVariantType: input.logoVariantType ?? null,
    logoDisabled: input.logoDisabled === true,
    logoPosition: input.logoPosition ?? null,
    logoSize: input.logoSize ?? null,
    imageModel: input.imageModel ?? null,
    visualInputs: (() => {
      const raw = Array.isArray(input.visualInputs) ? input.visualInputs : []
      const cleaned = raw.map((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return row
        const rest = { ...(row as Record<string, unknown>) }
        delete rest.url
        return rest
      })
      const parsed = parseDesignedVisualInputs(cleaned)
      return parsed.ok ? designedVisualAuditMeta(parsed.inputs) : []
    })(),
  }
}

export function mergeDesignedMetaIntoContent(
  content: unknown,
  meta: DesignedSavedMeta | null | undefined,
): unknown {
  if (!meta || !content || typeof content !== 'object' || Array.isArray(content)) {
    return content
  }
  return {
    ...(content as Record<string, unknown>),
    _designed: buildDesignedLibraryMeta(meta),
  }
}

/** Prepaid generate - Use this / logo changes must not charge again. */
export function isPrepaidVisualPath(visualPath?: string | null): boolean {
  return visualPath === 'reference_recreation' || visualPath === AI_DESIGNED_VISUAL_PATH
}

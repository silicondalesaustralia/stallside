/** Stored on hybrid_social_renders.content._recreate for “another like this”. */
export type RecreateSavedMeta = {
  recreateMode?: string | null
  messageAngle?: string | null
  campaignFocus?: string | null
  visualPath?: string | null
  imageModel?: string | null
  generationSource?: string | null
  logoAssetId?: string | null
  logoVariantType?: string | null
  logoDisabled?: boolean
  logoPosition?: string | null
  logoSize?: string | null
}

/** Prepaid generate paths were already paid. Do not charge again on Use this. */
export function shouldChargeOnRecreateSave(visualPath?: string | null): boolean {
  return visualPath !== 'reference_recreation' && visualPath !== 'ai_designed'
}

export function buildRecreateLibraryMeta(input: RecreateSavedMeta): RecreateSavedMeta {
  return {
    recreateMode: input.recreateMode ?? null,
    messageAngle: input.messageAngle ?? null,
    campaignFocus: input.campaignFocus ?? null,
    visualPath: input.visualPath ?? 'reference_recreation',
    imageModel: input.imageModel ?? null,
    generationSource: input.generationSource ?? 'recreate_reference',
    logoAssetId: input.logoAssetId ?? null,
    logoVariantType: input.logoVariantType ?? null,
    logoDisabled: input.logoDisabled === true,
    logoPosition: input.logoPosition ?? null,
    logoSize: input.logoSize ?? null,
  }
}

/** Persist Recreate metadata on hybrid_social_renders.content._recreate. */
export function mergeRecreateMetaIntoContent(
  content: unknown,
  meta: RecreateSavedMeta | null | undefined,
): unknown {
  if (!meta || !content || typeof content !== 'object' || Array.isArray(content)) {
    return content
  }
  return {
    ...(content as Record<string, unknown>),
    _recreate: {
      generationSource: 'recreate_reference',
      ...buildRecreateLibraryMeta(meta),
    },
  }
}

import type { DesignedVariantPreview } from '@/lib/social/designedTypes'
import type { WeekPlanVariantPreviewStored } from '@/lib/social/weekPlan/types'

export function toStoredVariantPreviews(
  variants: DesignedVariantPreview[],
): WeekPlanVariantPreviewStored[] {
  return variants.map((v, index) => ({
    id: v.id,
    index,
    label: v.label,
    imageUrl: v.imageUrl,
    storagePath: v.baseStoragePath.replace(/-base\.webp$/, '.webp'),
    baseStoragePath: v.baseStoragePath,
    messageAngle: v.messageAngle,
    userBrief: v.userBrief,
    intentChip: v.intentChip,
    jobId: v.jobId,
    visualPath: v.visualPath,
    imageModel: v.imageModel,
    logoAssetId: v.logoAssetId,
    logoVariantType: v.logoVariantType,
    logoDisabled: v.logoDisabled,
    logoPosition: v.logoPosition,
    logoSize: v.logoSize,
  }))
}

export function resolveVariantImageUrl(
  preview: WeekPlanVariantPreviewStored,
): string {
  return preview.imageUrl
}

export function findStoredVariant(
  previews: WeekPlanVariantPreviewStored[] | null | undefined,
  variantId: string,
): WeekPlanVariantPreviewStored | null {
  if (!previews?.length) return null
  return previews.find((p) => p.id === variantId) ?? null
}

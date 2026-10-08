import type { SupabaseClient } from '@supabase/supabase-js'
import { applyRecreateBusinessLogo } from '@/lib/social/compositeRecreateLogo'
import { storeRecreateVisual } from '@/lib/social/storeRecreateVisual'
import {
  isOwnedSocialCreativeBasePath,
  parseRecreateLogoChoice,
  resolveRecreateLogoAsset,
  socialCreativePreviewStoragePath,
  type RecreateLogoChoice,
} from '@/lib/brand/businessBrandLogos'
import {
  parseRecreateLogoPosition,
  parseRecreateLogoSize,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import {
  finalizeWeekPlanItemToLibrary,
  isItemProductionLocked,
} from '@/lib/social/weekPlan/finalizeWeekPlanItem'
import { findStoredVariant } from '@/lib/social/weekPlan/weekPlanVariantStorage'
import { loadPlanForBusiness, serializeItemRow } from '@/lib/social/weekPlan/weekPlanService'
import type {
  WeekPlanItemRow,
  WeekPlanReviewStatus,
  WeekPlanVariantPreviewStored,
} from '@/lib/social/weekPlan/types'

export type TrustedVariantLogoResult = {
  id: string
  imageUrl: string
  storagePath: string
  logoAssetId: string | null
  logoVariantType: string | null
  logoDisabled: boolean
  logoPosition: RecreateLogoPosition
  logoSize: RecreateLogoSize
}

/** Strip cache-bust query params before persisting canonical preview URLs. */
export function canonicalPreviewImageUrl(url: string): string {
  const q = url.indexOf('?')
  return q === -1 ? url : url.slice(0, q)
}

/** Merge server-trusted logo compositing output into one variant - other previews unchanged. */
export function mergeTrustedLogoIntoVariantPreviews(
  previews: WeekPlanVariantPreviewStored[] | null | undefined,
  variantId: string,
  trusted: TrustedVariantLogoResult,
): WeekPlanVariantPreviewStored[] {
  if (!previews?.length) throw new Error('No previews on this post')
  const idx = previews.findIndex((p) => p.id === variantId)
  if (idx === -1) throw new Error('Variant not found on this post')

  return previews.map((preview) => {
    if (preview.id !== variantId) return preview
    return {
      ...preview,
      imageUrl: canonicalPreviewImageUrl(trusted.imageUrl),
      storagePath: trusted.storagePath,
      logoAssetId: trusted.logoAssetId,
      logoVariantType: trusted.logoVariantType,
      logoDisabled: trusted.logoDisabled,
      logoPosition: trusted.logoPosition,
      logoSize: trusted.logoSize,
    }
  })
}

/**
 * Approved items must be re-approved after logo change - media changed.
 * Selected stays selected; needs_selection unchanged.
 */
export function logoChangeReviewPatch(
  item: Pick<WeekPlanItemRow, 'review_status' | 'hybrid_render_id'>,
): Partial<{
  review_status: WeekPlanReviewStatus
  hybrid_render_id: null
  approved_at: null
}> {
  if (item.review_status === 'approved' || item.hybrid_render_id) {
    return {
      review_status: 'selected',
      hybrid_render_id: null,
      approved_at: null,
    }
  }
  return {}
}

async function loadOwnedItem(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
): Promise<{ item: WeekPlanItemRow } | null> {
  const loaded = await loadPlanForBusiness(db, businessId, planId)
  if (!loaded) return null
  const item = loaded.items.find((i) => i.id === itemId)
  if (!item) return null
  return { item }
}

/** Server-side logo compositing from DB-stored base path - never trusts browser image URLs. */
export async function compositeTrustedVariantLogo(
  db: SupabaseClient,
  businessId: string,
  variantId: string,
  baseStoragePath: string,
  choice: RecreateLogoChoice,
  logoPosition: RecreateLogoPosition,
  logoSize: RecreateLogoSize,
): Promise<TrustedVariantLogoResult> {
  if (!isOwnedSocialCreativeBasePath(businessId, baseStoragePath)) {
    throw new Error('Invalid base image path')
  }

  const { data: biz } = await db
    .from('businesses')
    .select('logo_url')
    .eq('id', businessId)
    .maybeSingle()

  const resolved = await resolveRecreateLogoAsset(
    db,
    businessId,
    choice,
    (biz as { logo_url?: string | null } | null)?.logo_url,
  )

  const downloaded = await db.storage.from('social-posts').download(baseStoragePath)
  if (downloaded.error || !downloaded.data) {
    throw new Error('Base image is no longer available')
  }

  const baseBuffer = Buffer.from(await downloaded.data.arrayBuffer())
  const logoApplied = await applyRecreateBusinessLogo({
    imageBuffer: baseBuffer,
    logoUrl: resolved.fetchUrl,
    showLogo: resolved.applyRealLogo,
    logoPosition,
    logoSize,
    resolveLogoUrl: async (url) => url,
  })

  const stored = await storeRecreateVisual(db, {
    businessId,
    renderId: variantId,
    buffer: logoApplied.buffer,
    storagePath: socialCreativePreviewStoragePath(businessId, variantId, baseStoragePath),
  })

  return {
    id: variantId,
    imageUrl: stored.imageUrl,
    storagePath: stored.storagePath,
    logoAssetId: resolved.asset?.id ?? null,
    logoVariantType: resolved.asset?.variant_type ?? null,
    logoDisabled: !resolved.applyRealLogo,
    logoPosition,
    logoSize,
  }
}

export type ApplyWeekPlanVariantLogoInput = {
  variantId: string
  logoAssetId?: unknown
  showLogo?: unknown
  logoPosition?: unknown
  logoSize?: unknown
}

export async function applyLogoToWeekPlanVariant(
  db: SupabaseClient,
  businessId: string,
  planId: string,
  itemId: string,
  input: ApplyWeekPlanVariantLogoInput,
): Promise<WeekPlanItemRow> {
  const variantId = input.variantId?.trim()
  if (!variantId) throw new Error('variantId is required')

  const loaded = await loadOwnedItem(db, businessId, planId, itemId)
  if (!loaded) throw new Error('Plan item not found')

  const { item } = loaded
  if (isItemProductionLocked(item)) {
    throw new Error('This post is already scheduled or skipped')
  }
  if (item.generation_status !== 'generated') {
    throw new Error('Post is not ready for logo changes')
  }

  const variant = findStoredVariant(item.variant_previews, variantId)
  if (!variant) throw new Error('Variant not found on this post')

  const basePath = variant.baseStoragePath?.trim()
  if (!basePath) throw new Error('Variant base image not available')

  const choice = parseRecreateLogoChoice({
    logoAssetId: input.logoAssetId,
    showLogo: input.showLogo,
  })
  if ('ok' in choice) throw new Error(choice.error)

  const parsedPosition = parseRecreateLogoPosition(input.logoPosition)
  if (typeof parsedPosition === 'object' && 'ok' in parsedPosition) {
    throw new Error(parsedPosition.error)
  }
  const logoPosition: RecreateLogoPosition = parsedPosition

  const parsedSize = parseRecreateLogoSize(input.logoSize)
  if (typeof parsedSize === 'object' && 'ok' in parsedSize) {
    throw new Error(parsedSize.error)
  }
  const logoSize: RecreateLogoSize = parsedSize

  const trusted = await compositeTrustedVariantLogo(
    db,
    businessId,
    variantId,
    basePath,
    choice,
    logoPosition,
    logoSize,
  )

  const nextPreviews = mergeTrustedLogoIntoVariantPreviews(
    item.variant_previews,
    variantId,
    trusted,
  )
  const reviewPatch = logoChangeReviewPatch(item)
  const now = new Date().toISOString()

  const { data, error } = await db
    .from('social_week_plan_items')
    .update({
      variant_previews: nextPreviews,
      ...reviewPatch,
      updated_at: now,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .eq('plan_id', planId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return serializeItemRow(data)
}

/** Finalization reads persisted variant_previews from DB - used in tests. */
export async function finalizeItemFromPersistedVariant(
  db: SupabaseClient,
  item: WeekPlanItemRow,
  variantId: string,
) {
  const variant = findStoredVariant(item.variant_previews, variantId)
  if (!variant) throw new Error('Variant not found')
  return finalizeWeekPlanItemToLibrary(db, item, variant)
}

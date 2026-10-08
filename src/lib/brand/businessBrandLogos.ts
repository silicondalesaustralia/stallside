import type { SupabaseClient } from '@supabase/supabase-js'
import {
  BUSINESS_ASSETS_BUCKET,
  businessAssetsPathFromLogoUrl,
  signBusinessLogoUrl,
} from '@/lib/storage/businessAssets'

export const BRAND_LOGO_VARIANT_TYPES = [
  'primary',
  'light',
  'dark',
  'icon',
  'horizontal',
  'stacked',
  'other',
] as const

export type BrandLogoVariantType = (typeof BRAND_LOGO_VARIANT_TYPES)[number]

export const BRAND_LOGO_VARIANT_LABELS: Record<BrandLogoVariantType, string> = {
  primary: 'Primary',
  light: 'White',
  dark: 'Dark',
  icon: 'Icon',
  horizontal: 'Horizontal',
  stacked: 'Stacked',
  other: 'Other',
}

export const RECREATE_NO_LOGO_ID = 'none'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type BrandLogoAssetRow = {
  id: string
  business_id: string
  asset_type: string
  storage_path: string
  public_url: string | null
  display_name: string
  variant_type: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export type BrandLogoAsset = {
  id: string
  businessId: string
  storagePath: string
  publicUrl: string | null
  displayName: string
  variantType: BrandLogoVariantType
  isPrimary: boolean
  createdAt: string
  previewUrl?: string | null
}

export type RecreateLogoChoice =
  | { kind: 'none' }
  | { kind: 'primary' }
  | { kind: 'asset'; id: string }

export function parseBrandLogoVariantType(value: unknown): BrandLogoVariantType {
  if (typeof value === 'string' && (BRAND_LOGO_VARIANT_TYPES as readonly string[]).includes(value)) {
    return value as BrandLogoVariantType
  }
  return 'other'
}

export function isBrandLogoAssetId(value: string): boolean {
  return UUID_RE.test(value.trim())
}

export function brandLogoStoragePath(businessId: string, assetId: string): string {
  return `${businessId}/brand-logos/${assetId}.webp`
}

export function isOwnedBrandLogoPath(businessId: string, storagePath: string): boolean {
  const path = storagePath.trim()
  return path.startsWith(`${businessId}/`) && !path.includes('..')
}

export function isOwnedRecreatePreviewPath(businessId: string, storagePath: string): boolean {
  const path = storagePath.trim()
  return (
    path.startsWith(`${businessId}/inspiration-preview/`) &&
    path.endsWith('.webp') &&
    !path.includes('..')
  )
}

export function isOwnedRecreateBasePath(businessId: string, storagePath: string): boolean {
  return isOwnedRecreatePreviewPath(businessId, storagePath) && storagePath.trim().endsWith('-base.webp')
}

export function recreateBaseStoragePath(businessId: string, variantId: string): string {
  return `${businessId}/inspiration-preview/${variantId}-base.webp`
}

export function recreatePreviewStoragePath(businessId: string, variantId: string): string {
  return `${businessId}/inspiration-preview/${variantId}.webp`
}

export function isOwnedDesignedPreviewPath(businessId: string, storagePath: string): boolean {
  const path = storagePath.trim()
  return (
    path.startsWith(`${businessId}/designed-preview/`) &&
    path.endsWith('.webp') &&
    !path.includes('..')
  )
}

export function isOwnedDesignedBasePath(businessId: string, storagePath: string): boolean {
  return isOwnedDesignedPreviewPath(businessId, storagePath) && storagePath.trim().endsWith('-base.webp')
}

/** Owned clean base under Recreate or AI Designed preview prefixes only. */
export function isOwnedSocialCreativeBasePath(businessId: string, storagePath: string): boolean {
  return isOwnedRecreateBasePath(businessId, storagePath) || isOwnedDesignedBasePath(businessId, storagePath)
}

export function designedBaseStoragePath(businessId: string, variantId: string): string {
  return `${businessId}/designed-preview/${variantId}-base.webp`
}

export function designedPreviewStoragePath(businessId: string, variantId: string): string {
  return `${businessId}/designed-preview/${variantId}.webp`
}

export function socialCreativePreviewStoragePath(
  businessId: string,
  variantId: string,
  baseStoragePath: string,
): string {
  if (isOwnedDesignedBasePath(businessId, baseStoragePath)) {
    return designedPreviewStoragePath(businessId, variantId)
  }
  return recreatePreviewStoragePath(businessId, variantId)
}

/**
 * Recreate request → logo choice.
 * showLogo === false or logoAssetId "none"/null → no logo.
 * Valid uuid → that asset. Omitted → Primary.
 */
export function parseRecreateLogoChoice(input: {
  logoAssetId?: unknown
  showLogo?: unknown
}): RecreateLogoChoice | { ok: false; error: string } {
  if (input.showLogo === false) return { kind: 'none' }
  if (input.logoAssetId === null || input.logoAssetId === RECREATE_NO_LOGO_ID) {
    return { kind: 'none' }
  }
  if (input.logoAssetId === undefined || input.logoAssetId === '') {
    return { kind: 'primary' }
  }
  if (typeof input.logoAssetId !== 'string' || !isBrandLogoAssetId(input.logoAssetId)) {
    return { ok: false, error: 'Invalid logoAssetId' }
  }
  return { kind: 'asset', id: input.logoAssetId.trim() }
}

export function mapBrandLogoRow(row: BrandLogoAssetRow): BrandLogoAsset {
  return {
    id: row.id,
    businessId: row.business_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    displayName: row.display_name,
    variantType: parseBrandLogoVariantType(row.variant_type),
    isPrimary: Boolean(row.is_primary),
    createdAt: row.created_at,
  }
}

export function storagePathFromLogoUrl(logoUrl: string, businessId: string): string {
  return businessAssetsPathFromLogoUrl(logoUrl) || `${businessId}/logo.webp`
}

export async function listBrandLogoRows(
  db: SupabaseClient,
  businessId: string,
): Promise<BrandLogoAssetRow[]> {
  const { data, error } = await db
    .from('business_brand_assets')
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .eq('business_id', businessId)
    .eq('asset_type', 'logo')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as BrandLogoAssetRow[]
}

export async function getBrandLogoForBusiness(
  db: SupabaseClient,
  businessId: string,
  assetId: string,
): Promise<BrandLogoAssetRow | null> {
  const { data } = await db
    .from('business_brand_assets')
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .eq('id', assetId)
    .eq('business_id', businessId)
    .eq('asset_type', 'logo')
    .maybeSingle()
  return (data as BrandLogoAssetRow | null) ?? null
}

export async function syncBusinessPrimaryLogoUrl(
  db: SupabaseClient,
  businessId: string,
  publicUrl: string | null,
): Promise<void> {
  const { error } = await db
    .from('businesses')
    .update({ logo_url: publicUrl })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
}

export async function setPrimaryBrandLogo(
  db: SupabaseClient,
  businessId: string,
  assetId: string,
): Promise<BrandLogoAssetRow> {
  const target = await getBrandLogoForBusiness(db, businessId, assetId)
  if (!target) throw new Error('Logo not found')

  const { error: clearErr } = await db
    .from('business_brand_assets')
    .update({ is_primary: false, updated_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('asset_type', 'logo')
    .eq('is_primary', true)
  if (clearErr) throw new Error(clearErr.message)

  const { data, error } = await db
    .from('business_brand_assets')
    .update({ is_primary: true, updated_at: new Date().toISOString() })
    .eq('id', assetId)
    .eq('business_id', businessId)
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .single()
  if (error || !data) throw new Error(error?.message || 'Failed to set primary logo')

  await syncBusinessPrimaryLogoUrl(db, businessId, (data as BrandLogoAssetRow).public_url)
  return data as BrandLogoAssetRow
}

export async function ensurePrimaryBrandLogoFromUrl(
  db: SupabaseClient,
  businessId: string,
  logoUrl: string | null | undefined,
): Promise<BrandLogoAssetRow | null> {
  const existing = await listBrandLogoRows(db, businessId)
  if (existing.length > 0) {
    return existing.find((row) => row.is_primary) ?? existing[0]
  }
  const trimmed = logoUrl?.trim()
  if (!trimmed) return null

  const storagePath = storagePathFromLogoUrl(trimmed, businessId)
  const publicUrl = trimmed.split('?')[0] || trimmed
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('business_brand_assets')
    .insert({
      business_id: businessId,
      asset_type: 'logo',
      storage_path: storagePath,
      public_url: publicUrl,
      display_name: 'Primary logo',
      variant_type: 'primary',
      is_primary: true,
      created_at: now,
      updated_at: now,
    })
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .single()
  if (error || !data) throw new Error(error?.message || 'Failed to backfill primary logo')
  return data as BrandLogoAssetRow
}

export async function resolveRecreateLogoAsset(
  db: SupabaseClient,
  businessId: string,
  choice: RecreateLogoChoice,
  fallbackLogoUrl?: string | null,
): Promise<{
  applyRealLogo: boolean
  asset: BrandLogoAssetRow | null
  fetchUrl: string | null
}> {
  if (choice.kind === 'none') {
    return { applyRealLogo: false, asset: null, fetchUrl: null }
  }

  let asset: BrandLogoAssetRow | null = null
  if (choice.kind === 'asset') {
    asset = await getBrandLogoForBusiness(db, businessId, choice.id)
    if (!asset) {
      throw Object.assign(new Error('Logo not found'), { code: 'logo_not_found' })
    }
  } else {
    const rows = await listBrandLogoRows(db, businessId)
    asset = rows.find((row) => row.is_primary) ?? rows[0] ?? null
  }

  if (!asset) {
    const signed = fallbackLogoUrl?.trim()
      ? await signBusinessLogoUrl(db, fallbackLogoUrl)
      : null
    return { applyRealLogo: Boolean(signed), asset: null, fetchUrl: signed }
  }

  const fetchUrl =
    (await signBusinessLogoUrl(db, asset.public_url)) ||
    (await signStoragePath(db, asset.storage_path))
  return { applyRealLogo: Boolean(fetchUrl), asset, fetchUrl }
}

async function signStoragePath(
  db: SupabaseClient,
  storagePath: string,
): Promise<string | null> {
  const path = storagePath.trim()
  if (!path) return null
  const { data, error } = await db.storage
    .from(BUSINESS_ASSETS_BUCKET)
    .createSignedUrl(path, 60 * 60)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function signBrandLogoPreview(
  db: SupabaseClient,
  asset: BrandLogoAssetRow,
): Promise<string | null> {
  return (
    (await signBusinessLogoUrl(db, asset.public_url)) ||
    (await signStoragePath(db, asset.storage_path))
  )
}

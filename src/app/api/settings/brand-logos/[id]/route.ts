import { NextRequest, NextResponse } from 'next/server'
import { requireTradiesPostBrandManage } from '@/lib/products/requireTradiesPostBrandManage'
import { BUSINESS_ASSETS_BUCKET } from '@/lib/storage/businessAssets'
import {
  getBrandLogoForBusiness,
  isBrandLogoAssetId,
  listBrandLogoRows,
  mapBrandLogoRow,
  parseBrandLogoVariantType,
  setPrimaryBrandLogo,
  signBrandLogoPreview,
  syncBusinessPrimaryLogoUrl,
} from '@/lib/brand/businessBrandLogos'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  const ctx = await requireTradiesPostBrandManage()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx
  const { id } = await context.params
  if (!isBrandLogoAssetId(id)) {
    return NextResponse.json({ error: 'Invalid logo id' }, { status: 400 })
  }

  let body: { displayName?: unknown; variantType?: unknown; isPrimary?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const existing = await getBrandLogoForBusiness(db, businessId, id)
  if (!existing) {
    return NextResponse.json({ error: 'Logo not found', code: 'logo_not_found' }, { status: 404 })
  }

  if (body.isPrimary === true && !existing.is_primary) {
    const row = await setPrimaryBrandLogo(db, businessId, id)
    return NextResponse.json({
      logo: {
        ...mapBrandLogoRow(row),
        previewUrl: await signBrandLogoPreview(db, row),
      },
      primaryLogoUrl: row.public_url,
    })
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.displayName === 'string' && body.displayName.trim()) {
    patch.display_name = body.displayName.trim().slice(0, 80)
  }
  if (body.variantType !== undefined) {
    patch.variant_type = parseBrandLogoVariantType(body.variantType)
  }

  const { data, error } = await db
    .from('business_brand_assets')
    .update(patch)
    .eq('id', id)
    .eq('business_id', businessId)
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .single()
  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 })
  }
  return NextResponse.json({
    logo: {
      ...mapBrandLogoRow(data),
      previewUrl: await signBrandLogoPreview(db, data),
    },
  })
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const ctx = await requireTradiesPostBrandManage()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx
  const { id } = await context.params
  if (!isBrandLogoAssetId(id)) {
    return NextResponse.json({ error: 'Invalid logo id' }, { status: 400 })
  }

  const existing = await getBrandLogoForBusiness(db, businessId, id)
  if (!existing) {
    return NextResponse.json({ error: 'Logo not found', code: 'logo_not_found' }, { status: 404 })
  }

  const others = (await listBrandLogoRows(db, businessId)).filter((row) => row.id !== id)
  if (existing.is_primary && others.length > 0) {
    await setPrimaryBrandLogo(db, businessId, others[0].id)
  }

  const { error } = await db
    .from('business_brand_assets')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)
  if (error) {
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 })
  }

  if (existing.storage_path.startsWith(`${businessId}/`)) {
    await db.storage.from(BUSINESS_ASSETS_BUCKET).remove([existing.storage_path])
  }

  if (others.length === 0) {
    await syncBusinessPrimaryLogoUrl(db, businessId, null)
  }

  const remaining = await listBrandLogoRows(db, businessId)
  const primary = remaining.find((row) => row.is_primary) ?? remaining[0] ?? null
  return NextResponse.json({
    ok: true,
    primaryLogoUrl: primary?.public_url ?? null,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { requireTradiesPostBrandManage } from '@/lib/products/requireTradiesPostBrandManage'
import { convertToWebP } from '@/lib/imageProcessor'
import { BUSINESS_ASSETS_BUCKET } from '@/lib/storage/businessAssets'
import {
  brandLogoStoragePath,
  ensurePrimaryBrandLogoFromUrl,
  listBrandLogoRows,
  mapBrandLogoRow,
  parseBrandLogoVariantType,
  signBrandLogoPreview,
  syncBusinessPrimaryLogoUrl,
} from '@/lib/brand/businessBrandLogos'

const MAX_LOGO_BYTES = 5 * 1024 * 1024
const LOGO_ACCEPT_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data: biz } = await db
    .from('businesses')
    .select('logo_url')
    .eq('id', businessId)
    .maybeSingle()

  await ensurePrimaryBrandLogoFromUrl(
    db,
    businessId,
    (biz as { logo_url?: string | null } | null)?.logo_url ?? null,
  )

  const rows = await listBrandLogoRows(db, businessId)
  const logos = await Promise.all(
    rows.map(async (row) => {
      const mapped = mapBrandLogoRow(row)
      return {
        ...mapped,
        previewUrl: await signBrandLogoPreview(db, row),
      }
    }),
  )
  return NextResponse.json({ logos })
}

export async function POST(req: NextRequest) {
  const ctx = await requireTradiesPostBrandManage()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
  }
  const mime = (file.type || '').toLowerCase()
  if (mime && !LOGO_ACCEPT_TYPES.has(mime)) {
    return NextResponse.json({ error: 'Use a PNG, JPG, or WebP image' }, { status: 400 })
  }

  const displayNameRaw = typeof formData.get('displayName') === 'string'
    ? String(formData.get('displayName')).trim()
    : ''
  const variantType = parseBrandLogoVariantType(formData.get('variantType'))
  const existing = await listBrandLogoRows(db, businessId)
  const makePrimary = existing.length === 0
  const assetId = randomUUID()
  const storagePath = brandLogoStoragePath(businessId, assetId)
  const raw = Buffer.from(await file.arrayBuffer())
  const webp = await convertToWebP(raw, 800, 85, true)

  const { error: uploadError } = await db.storage
    .from(BUSINESS_ASSETS_BUCKET)
    .upload(storagePath, webp, { contentType: 'image/webp', upsert: true })
  if (uploadError) {
    console.error('[brand-logos] upload failed', uploadError.message)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = db.storage.from(BUSINESS_ASSETS_BUCKET).getPublicUrl(storagePath)
  const publicUrlWithCache = `${publicUrl}?t=${Date.now()}`
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('business_brand_assets')
    .insert({
      id: assetId,
      business_id: businessId,
      asset_type: 'logo',
      storage_path: storagePath,
      public_url: publicUrlWithCache,
      display_name: displayNameRaw || (makePrimary ? 'Primary logo' : 'Logo'),
      variant_type: makePrimary ? 'primary' : variantType,
      is_primary: makePrimary,
      created_at: now,
      updated_at: now,
    })
    .select(
      'id, business_id, asset_type, storage_path, public_url, display_name, variant_type, is_primary, created_at, updated_at',
    )
    .single()
  if (error || !data) {
    console.error('[brand-logos] insert failed', error?.message)
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 })
  }

  if (makePrimary) {
    await syncBusinessPrimaryLogoUrl(db, businessId, publicUrlWithCache)
  }

  return NextResponse.json({
    logo: {
      ...mapBrandLogoRow(data),
      previewUrl: await signBrandLogoPreview(db, data),
    },
    primaryLogoUrl: makePrimary ? publicUrlWithCache : undefined,
  })
}

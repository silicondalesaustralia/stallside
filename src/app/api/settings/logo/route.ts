import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { convertToWebP } from '@/lib/imageProcessor'
import {
  BUSINESS_ASSETS_BUCKET,
  candidateLogoStoragePaths,
} from '@/lib/storage/businessAssets'
import {
  ensurePrimaryBrandLogoFromUrl,
  listBrandLogoRows,
  setPrimaryBrandLogo,
  syncBusinessPrimaryLogoUrl,
} from '@/lib/brand/businessBrandLogos'

const MAX_LOGO_BYTES = 5 * 1024 * 1024
const LOGO_ACCEPT_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

async function downloadFirstLogo(
  db: SupabaseClient,
  businessId: string,
  logoUrl: string | null,
) {
  for (const path of candidateLogoStoragePaths(businessId, logoUrl)) {
    const { data, error } = await db.storage.from(BUSINESS_ASSETS_BUCKET).download(path)
    if (!error && data) return { data, path }
  }
  return null
}

export async function GET() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { data: biz } = await db
    .from('businesses')
    .select('logo_url')
    .eq('id', businessId)
    .maybeSingle()

  const found = await downloadFirstLogo(
    db,
    businessId,
    (biz as { logo_url?: string | null } | null)?.logo_url ?? null,
  )
  if (!found) {
    return new NextResponse(null, { status: 404 })
  }

  const buffer = Buffer.from(await found.data.arrayBuffer())
  const contentType = found.data.type || 'image/jpeg'
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
    },
  })
}

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
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

  const raw = Buffer.from(await file.arrayBuffer())
  const webp = await convertToWebP(raw, 800, 85, true)
  const path = `${businessId}/logo.webp`

  const { error: uploadError } = await db.storage
    .from(BUSINESS_ASSETS_BUCKET)
    .upload(path, webp, { contentType: 'image/webp', upsert: true })
  if (uploadError) {
    console.error('[settings/logo] upload failed', uploadError.message)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = db.storage.from(BUSINESS_ASSETS_BUCKET).getPublicUrl(path)
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await db
    .from('businesses')
    .update({ logo_url: logoUrl })
    .eq('id', businessId)
  if (updateError) {
    console.error('[settings/logo] persist failed', updateError.message)
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 })
  }

  try {
    const existing = await listBrandLogoRows(db, businessId)
    const primary = existing.find((row) => row.is_primary)
    if (primary) {
      await db
        .from('business_brand_assets')
        .update({
          storage_path: path,
          public_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', primary.id)
        .eq('business_id', businessId)
    } else {
      await ensurePrimaryBrandLogoFromUrl(db, businessId, logoUrl)
    }
  } catch (err) {
    console.warn(
      '[settings/logo] library sync failed',
      err instanceof Error ? err.message : String(err),
    )
  }

  return NextResponse.json({ logoUrl })
}

export async function DELETE() {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const rows = await listBrandLogoRows(db, businessId)
  const primary = rows.find((row) => row.is_primary) ?? rows[0]
  if (primary && rows.length > 1) {
    const next = rows.find((row) => row.id !== primary.id)
    if (next) await setPrimaryBrandLogo(db, businessId, next.id)
    await db
      .from('business_brand_assets')
      .delete()
      .eq('id', primary.id)
      .eq('business_id', businessId)
  } else if (primary) {
    await db
      .from('business_brand_assets')
      .delete()
      .eq('id', primary.id)
      .eq('business_id', businessId)
    await syncBusinessPrimaryLogoUrl(db, businessId, null)
  } else {
    await syncBusinessPrimaryLogoUrl(db, businessId, null)
  }
  return NextResponse.json({ ok: true })
}

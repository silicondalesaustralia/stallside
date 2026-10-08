// ============================================================
// app/api/social/upload-media/route.ts
// Small image uploads for Compose / Create tab (proxied via Vercel).
//
// Images → converted to WebP (max 2048px, quality 85) via sharp
//
// Video uploads use direct signed upload instead:
//   POST /api/social/media-assets/upload-url (Library V1)
//
// Storage bucket: social-posts
//   images: social-posts/{businessId}/uploads/{timestamp}.webp
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { convertToWebP } from '@/lib/imageProcessor'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10 MB
const MAX_FILES = 10

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'])

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db: storage } = ctx

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const files = formData.getAll('file') as File[]
  if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Max ${MAX_FILES} files per upload` }, { status: 400 })
  }

  const results: { url: string; type: 'image'; mimeType: string }[] = []
  const errors: string[] = []

  for (const file of files) {
    const isImage = IMAGE_TYPES.has(file.type)

    if (!isImage) {
      if (file.type.startsWith('video/')) {
        errors.push(
          `${file.name}: use Social → Library → Add content → Upload video for video files`,
        )
      } else {
        errors.push(`${file.name}: unsupported type ${file.type}`)
      }
      continue
    }

    if (file.size > MAX_IMAGE_SIZE) {
      errors.push(`${file.name}: image must be under 10MB`)
      continue
    }

    try {
      const rawBuffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '')

      const webpBuffer = await convertToWebP(rawBuffer, 2048, 85)
      const path = `${businessId}/uploads/${timestamp}-${safeName}.webp`

      const { error: uploadErr } = await storage.storage
        .from('social-posts')
        .upload(path, webpBuffer, { contentType: 'image/webp', upsert: false })

      if (uploadErr) { errors.push(`${file.name}: ${uploadErr.message}`); continue }

      const { data: { publicUrl } } = storage.storage.from('social-posts').getPublicUrl(path)
      results.push({ url: publicUrl, type: 'image', mimeType: 'image/webp' })
    } catch (err) {
      errors.push(`${file.name}: ${String(err)}`)
    }
  }

  return NextResponse.json(
    { media: results, errors: errors.length ? errors : undefined, count: results.length },
    { status: results.length > 0 ? 200 : 422 }
  )
}

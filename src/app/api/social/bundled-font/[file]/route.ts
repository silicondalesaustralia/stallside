/**
 * Serves bundled social TTFs for browser @font-face preview in the compose UI.
 * Same files as resvg server-side render - not a separate font set.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { BUNDLED_SOCIAL_FONTS } from '@/lib/social/bundledSocialFontManifest'
import { bundledSocialFontsDir } from '@/lib/social/bundledSocialFonts'

export const runtime = 'nodejs'

const ALLOWED_FILES = new Set(BUNDLED_SOCIAL_FONTS.map((f) => f.fileName))

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params
  const fileName = decodeURIComponent(file)

  if (!ALLOWED_FILES.has(fileName)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const filePath = join(bundledSocialFontsDir(), fileName)

  try {
    const buffer = readFileSync(filePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'font/ttf',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

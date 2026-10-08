import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { purgeStaleMediaAssetUploads } from '@/lib/social/purgeStaleMediaAssetUploads'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Daily cron - delete abandoned video uploads stuck in uploading for 48+ hours. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  try {
    const result = await purgeStaleMediaAssetUploads(db)
    console.log('[Cron media-asset-upload-cleanup]', result)
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Cron media-asset-upload-cleanup] Failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

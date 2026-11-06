import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncPendingTikTokPosts } from '@/lib/social/tiktok/syncPendingTikTokPosts'
import { syncPendingPinterestPosts } from '@/lib/social/pinterest/syncPendingPinterestPosts'

// Runs every 5 minutes via Vercel Cron (see vercel.json).
// TikTok publishing is async - resolves pending publish_ids to posted / failed.
// Also creates video Pins once Pinterest finishes processing the upload.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await createServiceClient()
    const result = await syncPendingTikTokPosts(db)
    const pinterest = await syncPendingPinterestPosts(db)
    console.log('[Cron tiktok-publish-status]', { ...result, pinterest })
    return NextResponse.json({ ok: true, ...result, pinterest })
  } catch (err) {
    console.error('[Cron tiktok-publish-status] Failed', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

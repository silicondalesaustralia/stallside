import { NextResponse } from 'next/server'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { canUseTikTokConnectDemo, isTikTokConnectEnabled } from '@/lib/social/tiktok/tiktokConfig'

export async function GET() {
  return NextResponse.json({
    tiktokConnectEnabled: isTikTokConnectEnabled(),
    socialDemoMode: isSocialDemoMode(),
    canUseTikTokConnectDemo: canUseTikTokConnectDemo(),
  })
}

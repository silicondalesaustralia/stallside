import { NextResponse } from 'next/server'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { canUsePinterestConnectDemo, isPinterestConnectEnabled } from '@/lib/social/pinterest/pinterestConfig'

export async function GET() {
  return NextResponse.json({
    pinterestConnectEnabled: isPinterestConnectEnabled(),
    socialDemoMode: isSocialDemoMode(),
    canUsePinterestConnectDemo: canUsePinterestConnectDemo(),
  })
}

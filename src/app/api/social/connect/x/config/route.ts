import { NextResponse } from 'next/server'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { canUseXConnectDemo, isXConnectEnabled } from '@/lib/social/x/xConfig'

export async function GET() {
  return NextResponse.json({
    xConnectEnabled: isXConnectEnabled(),
    socialDemoMode: isSocialDemoMode(),
    canUseXConnectDemo: canUseXConnectDemo(),
  })
}

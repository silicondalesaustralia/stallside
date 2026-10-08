import { NextResponse } from 'next/server'
import {
  canUseMetaConnectDemo,
  isMetaConnectEnabled,
  isSocialDemoMode,
} from '@/lib/social/metaConnectConfig'

export async function GET() {
  return NextResponse.json({
    metaConnectEnabled: isMetaConnectEnabled(),
    socialDemoMode: isSocialDemoMode(),
    canUseMetaConnectDemo: canUseMetaConnectDemo(),
  })
}

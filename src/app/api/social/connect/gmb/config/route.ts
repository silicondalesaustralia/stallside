import { NextResponse } from 'next/server'
import {
  canUseGmbConnectDemo,
  isGmbConnectEnabled,
  isSocialDemoMode,
} from '@/lib/social/gmbConnectConfig'

export async function GET() {
  return NextResponse.json({
    gmbConnectEnabled:     isGmbConnectEnabled(),
    socialDemoMode:        isSocialDemoMode(),
    canUseGmbConnectDemo:  canUseGmbConnectDemo(),
  })
}

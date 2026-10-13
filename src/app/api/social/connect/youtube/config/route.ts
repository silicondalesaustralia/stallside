import { NextResponse } from 'next/server'
import { isSocialDemoMode } from '@/lib/social/metaConnectConfig'
import { canUseYouTubeConnectDemo, isYouTubeConnectEnabled } from '@/lib/social/youtube/youtubeConfig'

export async function GET() {
  return NextResponse.json({
    youtubeConnectEnabled: isYouTubeConnectEnabled(),
    socialDemoMode: isSocialDemoMode(),
    canUseYouTubeConnectDemo: canUseYouTubeConnectDemo(),
  })
}

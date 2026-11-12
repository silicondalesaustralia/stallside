'use client'

import { ComposerStep } from '@/components/tradiespost/composer/ComposerStep'
import { ComposerTikTokSettings } from '@/components/tradiespost/composer/ComposerTikTokSettings'
import { ComposerYouTubeSettings } from '@/components/tradiespost/composer/ComposerYouTubeSettings'
import { ComposerPinterestSettings } from '@/components/tradiespost/composer/ComposerPinterestSettings'
import type { useComposerTikTokGate } from '@/components/tradiespost/composer/useComposerTikTok'
import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import type { ComposerPinterestState } from '@/components/tradiespost/composer/useComposerPinterest'

type Props = {
  gates: {
    tiktok: ReturnType<typeof useComposerTikTokGate>
    youtube: ComposerYouTubeState
    pinterest: ComposerPinterestState
  }
  isVideo: boolean
  videoDurationSeconds: number | null
  youtubeChannelTitle: string | null
  pinterestUsername: string | null
}

/** Per-platform settings steps (not text: that is in step 3), numbered from 4 in the order shown. */
export function ComposerPlatformSettingsSteps(props: Props) {
  const { tiktok, youtube, pinterest } = props.gates
  let next = 4

  return (
    <>
      {tiktok.active && (
        <ComposerStep number={next++} title="TikTok settings">
          <ComposerTikTokSettings
            state={tiktok.state}
            isVideo={props.isVideo}
            videoDurationSeconds={props.videoDurationSeconds}
          />
        </ComposerStep>
      )}
      {youtube.active && (
        <ComposerStep number={next++} title="YouTube settings">
          <ComposerYouTubeSettings state={youtube} channelTitle={props.youtubeChannelTitle} />
        </ComposerStep>
      )}
      {pinterest.active && (
        <ComposerStep number={next++} title="Pinterest settings">
          <ComposerPinterestSettings state={pinterest} username={props.pinterestUsername} />
        </ComposerStep>
      )}
    </>
  )
}

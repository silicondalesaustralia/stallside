'use client'

import { ComposerStep } from '@/components/tradiespost/composer/ComposerStep'
import { ComposerTikTokSettings } from '@/components/tradiespost/composer/ComposerTikTokSettings'
import { ComposerYouTubeSettings } from '@/components/tradiespost/composer/ComposerYouTubeSettings'
import { ComposerPinterestSettings } from '@/components/tradiespost/composer/ComposerPinterestSettings'
import type { useComposerTikTokGate } from '@/components/tradiespost/composer/useComposerTikTok'
import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import type { ComposerPinterestState } from '@/components/tradiespost/composer/useComposerPinterest'

type Props = {
  tiktok: ReturnType<typeof useComposerTikTokGate>
  youtube: ComposerYouTubeState
  pinterest: ComposerPinterestState
  caption: string
  isVideo: boolean
  videoDurationSeconds: number | null
  youtubeChannelTitle: string | null
  pinterestUsername: string | null
  jobId: string | null
}

/** Per-platform settings steps, numbered from 4 in the order shown. */
export function ComposerPlatformSettingsSteps(props: Props) {
  const { tiktok, youtube, pinterest, caption } = props
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
          <ComposerYouTubeSettings state={youtube} caption={caption} channelTitle={props.youtubeChannelTitle} />
        </ComposerStep>
      )}
      {pinterest.active && (
        <ComposerStep number={next++} title="Pinterest settings">
          <ComposerPinterestSettings state={pinterest} caption={caption} username={props.pinterestUsername} jobId={props.jobId} />
        </ComposerStep>
      )}
    </>
  )
}

'use client'

import { useState, type ReactNode } from 'react'
import { ComposerPreview } from '@/components/tradiespost/composer/ComposerPreview'
import { ComposerSchedulePanel } from '@/components/tradiespost/composer/ComposerSchedulePanel'
import { ComposerSubmitBar } from '@/components/tradiespost/composer/ComposerSubmitBar'
import { useComposerSubmit } from '@/components/tradiespost/composer/useComposerSubmit'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SocialWorkspaceBusiness } from '@/lib/social/useSocialWorkspace'
import type { PlatformCaptions, SocialConnectionState, SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { composerPlatformCaptions } from '@/lib/tradiespost/composer/platformText'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import type { TikTokPostSettings } from '@/lib/social/tiktok/tiktokSettings'
import type { YouTubePostSettings } from '@/lib/social/youtube/youtubeSettings'
import type { PinterestPostSettings } from '@/lib/social/pinterest/pinterestSettings'
import {
  composerBlockReason,
  schedulePublishingMode,
  submitLabel,
  timeZoneMismatch,
  type ComposerMode,
} from '@/lib/tradiespost/composer/composerState'

type PlatformGate<T> = { settings: T | null; blockReason: string | null }

type Props = {
  business: SocialWorkspaceBusiness | null
  platforms: SocialPublishPlatform[]
  connected: SocialConnectionState
  media: ComposerMedia | null
  caption: string
  /** Per-platform captions; blank platforms use `caption`. */
  overrides: PlatformCaptions
  headline: string
  jobId: string | null
  gates: {
    tiktok: PlatformGate<TikTokPostSettings>
    youtube: PlatformGate<YouTubePostSettings>
    pinterest: PlatformGate<PinterestPostSettings>
    x: PlatformGate<string>
  }
  onDone: (result: { mode: ComposerMode }) => void
  /** Save draft control, shown under the submit button. */
  draftAction?: ReactNode
  /** Media not ready to post yet (e.g. a chosen song not added to the video). */
  mediaBlockReason?: string | null
}

export function ComposerSidePanel(props: Props) {
  const { business, platforms, connected, media, caption, overrides, headline, jobId, onDone } = props
  const { tiktok, youtube, pinterest, x } = props.gates
  const [mode, setMode] = useState<ComposerMode>('now')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const { submit, submitting, submitError } = useComposerSubmit(onDone)

  const businessTz = resolveBusinessTimeZone(business?.timezone)
  const publishingMode = schedulePublishingMode(platforms, connected)
  const blockReason = props.mediaBlockReason || composerBlockReason({
    mode,
    selected: platforms,
    connected,
    imageUrl: media?.url ?? null,
    caption,
    overrides,
    date,
    isVideo: Boolean(media?.video),
    tiktokBlockReason: tiktok.blockReason,
    youtubeBlockReason: youtube.blockReason,
    pinterestBlockReason: pinterest.blockReason,
    xBlockReason: x.blockReason,
  })

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
      <ComposerPreview
        platforms={platforms}
        businessName={business?.name?.trim() || 'Your business'}
        logoUrl={business?.logo_url ?? null}
        imageUrl={media?.url ?? null}
        caption={caption}
        headline={headline}
      />
      <div className="space-y-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <ComposerSchedulePanel
          mode={mode}
          onMode={setMode}
          date={date}
          time={time}
          onDate={setDate}
          onTime={setTime}
          businessTz={businessTz}
          tzMismatch={timeZoneMismatch(businessTz)}
          manualSchedule={platforms.length > 0 && publishingMode === 'manual'}
        />
        <ComposerSubmitBar
          label={submitLabel({ mode, platforms, date, time })}
          blockReason={blockReason}
          submitting={submitting}
          error={submitError}
          onSubmit={() => {
            if (!media || blockReason) return
            const platformCaptions = composerPlatformCaptions({ selected: platforms, caption, overrides, headline, xText: x.settings })
            void submit({
              mode,
              caption: caption.trim() || Object.values(platformCaptions).find(Boolean) || '',
              platformCaptions,
              platforms,
              imageUrl: media.url,
              jobId,
              date,
              time,
              publishingMode,
              tiktokSettings: tiktok.settings,
              youtubeSettings: youtube.settings,
              pinterestSettings: pinterest.settings,
              video: media.video ?? null,
              tiktokSlides: media.slides ?? null,
            })
          }}
        />
        {props.draftAction}
      </div>
    </aside>
  )
}

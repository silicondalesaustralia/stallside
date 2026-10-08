'use client'

import { useState } from 'react'
import { ComposerPreview } from '@/components/tradiespost/composer/ComposerPreview'
import { ComposerSchedulePanel } from '@/components/tradiespost/composer/ComposerSchedulePanel'
import { ComposerSubmitBar } from '@/components/tradiespost/composer/ComposerSubmitBar'
import { useComposerSubmit } from '@/components/tradiespost/composer/useComposerSubmit'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SocialWorkspaceBusiness } from '@/lib/social/useSocialWorkspace'
import type { SocialConnectionState, SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import type { TikTokPostSettings } from '@/lib/social/tiktok/tiktokSettings'
import {
  composerBlockReason,
  facebookCaptionWithHeadline,
  schedulePublishingMode,
  submitLabel,
  timeZoneMismatch,
  type ComposerMode,
} from '@/lib/tradiespost/composer/composerState'

type Props = {
  business: SocialWorkspaceBusiness | null
  platforms: SocialPublishPlatform[]
  connected: SocialConnectionState
  media: ComposerMedia | null
  caption: string
  headline: string
  jobId: string | null
  tiktokSettings: TikTokPostSettings | null
  tiktokBlockReason: string | null
  onDone: (result: { mode: ComposerMode }) => void
}

export function ComposerSidePanel(props: Props) {
  const { business, platforms, connected, media, caption, headline, jobId, onDone } = props
  const { tiktokSettings, tiktokBlockReason } = props
  const [mode, setMode] = useState<ComposerMode>('now')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const { submit, submitting, submitError } = useComposerSubmit(onDone)

  const businessTz = resolveBusinessTimeZone(business?.timezone)
  const publishingMode = schedulePublishingMode(platforms, connected)
  const blockReason = composerBlockReason({
    mode,
    selected: platforms,
    connected,
    imageUrl: media?.url ?? null,
    caption,
    date,
    isVideo: Boolean(media?.video),
    tiktokBlockReason,
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
            void submit({
              mode,
              caption: caption.trim(),
              facebookCaption: facebookCaptionWithHeadline(headline, caption),
              platforms,
              imageUrl: media.url,
              jobId,
              date,
              time,
              publishingMode,
              tiktokSettings,
              video: media.video ?? null,
              tiktokSlides: media.slides ?? null,
            })
          }}
        />
      </div>
    </aside>
  )
}

'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { ComposerStep } from '@/components/tradiespost/composer/ComposerStep'
import { ComposerCaptionField } from '@/components/tradiespost/composer/ComposerCaptionField'
import { ComposerPlatformCaptionCard } from '@/components/tradiespost/composer/ComposerPlatformCaptionCard'
import { ComposerPlatformCaptionFields } from '@/components/tradiespost/composer/ComposerPlatformCaptionFields'
import type { useComposerCaption } from '@/components/tradiespost/composer/useComposerCaption'
import type { ComposerPlatformCopy } from '@/components/tradiespost/composer/useComposerPlatformCopy'
import type { ComposerPlatformWriter } from '@/components/tradiespost/composer/useComposerPlatformWriter'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { captionLimitFor, platformsUsingMainCaption } from '@/lib/tradiespost/composer/captionLimits'

type Props = {
  platforms: SocialPublishPlatform[]
  headline: string
  onHeadline: (value: string) => void
  captionState: ReturnType<typeof useComposerCaption>
  onWriteForMe: () => void
  copy: ComposerPlatformCopy
  writer: ComposerPlatformWriter
  xUsername: string | null
}

function statusFor(platform: SocialPublishPlatform, copy: ComposerPlatformCopy, headline: string): string {
  if (platform === 'x') return copy.x.touched ? 'Own post text' : 'Main caption, shortened to fit'
  const parts = [copy.overrides[platform]?.trim() ? 'Own caption' : 'Uses main caption']
  if (platform === 'facebook' && headline.trim()) parts.push('headline')
  if (platform === 'youtube' && copy.youtube.draft.title.trim()) parts.push('title')
  if (platform === 'youtube' && copy.youtube.draft.tags.trim()) parts.push('tags')
  if (platform === 'pinterest' && copy.pinterest.draft.title.trim()) parts.push('title')
  return parts.join(' + ')
}

export function ComposerCaptionStep(props: Props) {
  const { platforms, headline, onHeadline, captionState, onWriteForMe, copy, writer } = props
  const busy = Boolean(writer.writing) || captionState.generating
  const mainLimit = captionLimitFor(platformsUsingMainCaption(platforms, copy.overrides))

  return (
    <ComposerStep number={3} title="Write your captions">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void writer.write('all')}
          disabled={busy || !platforms.length}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5C518] px-3.5 py-2 text-xs font-bold text-[#18181B] disabled:opacity-50"
          data-testid="composer-write-all"
        >
          {writer.writing === 'all' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {writer.writing === 'all' ? 'Writing for every platform…' : 'Write all with AI'}
        </button>
        <span className="text-xs text-zinc-500">
          {platforms.length
            ? 'Writes a version for each platform, with headlines, titles and tags where they are needed.'
            : 'Pick platforms in step 1 first.'}
        </span>
      </div>
      {writer.error?.target === 'all' && <p className="mb-3 text-xs font-semibold text-red-600">{writer.error.message}</p>}

      <p className="mb-1.5 text-xs font-semibold text-zinc-600">Main caption</p>
      <ComposerCaptionField
        value={captionState.caption}
        onChange={captionState.setCaption}
        limit={mainLimit}
        generating={captionState.generating}
        error={captionState.captionError}
        onWriteForMe={onWriteForMe}
        onTryAnother={() => {
          if (!captionState.nextAlternative()) onWriteForMe()
        }}
      />

      {platforms.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-600">Each platform (optional: blank uses the main caption)</p>
          {platforms.map((platform) => (
            <ComposerPlatformCaptionCard
              key={platform}
              platform={platform}
              status={statusFor(platform, copy, headline)}
              writing={writer.writing === platform}
              disabled={busy}
              error={writer.error?.target === platform ? writer.error.message : null}
              onWrite={() => void writer.write(platform)}
            >
              <ComposerPlatformCaptionFields
                platform={platform}
                copy={copy}
                caption={captionState.caption}
                headline={headline}
                onHeadline={onHeadline}
                xUsername={props.xUsername}
              />
            </ComposerPlatformCaptionCard>
          ))}
        </div>
      )}
    </ComposerStep>
  )
}

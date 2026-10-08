'use client'

import { ComposerStep } from '@/components/tradiespost/composer/ComposerStep'
import { ComposerHeadlineField } from '@/components/tradiespost/composer/ComposerHeadlineField'
import { ComposerCaptionField } from '@/components/tradiespost/composer/ComposerCaptionField'
import type { useComposerCaption } from '@/components/tradiespost/composer/useComposerCaption'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { captionLimitFor } from '@/lib/tradiespost/composer/composerState'

type Props = {
  platforms: SocialPublishPlatform[]
  headline: string
  onHeadline: (value: string) => void
  captionState: ReturnType<typeof useComposerCaption>
  onWriteForMe: () => void
}

export function ComposerCaptionStep({ platforms, headline, onHeadline, captionState, onWriteForMe }: Props) {
  return (
    <ComposerStep number={3} title="Write a caption">
      {platforms.includes('facebook') && <ComposerHeadlineField value={headline} onChange={onHeadline} />}
      <ComposerCaptionField
        value={captionState.caption}
        onChange={captionState.setCaption}
        limit={captionLimitFor(platforms)}
        generating={captionState.generating}
        error={captionState.captionError}
        onWriteForMe={onWriteForMe}
        onTryAnother={() => {
          if (!captionState.nextAlternative()) onWriteForMe()
        }}
      />
    </ComposerStep>
  )
}

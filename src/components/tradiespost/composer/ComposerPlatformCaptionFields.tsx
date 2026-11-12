'use client'

import { ComposerHeadlineField } from '@/components/tradiespost/composer/ComposerHeadlineField'
import { ComposerOverrideTextarea } from '@/components/tradiespost/composer/ComposerOverrideTextarea'
import { ComposerYouTubeTextFields } from '@/components/tradiespost/composer/ComposerYouTubeTextFields'
import { ComposerPinterestTitleField } from '@/components/tradiespost/composer/ComposerPinterestTitleField'
import { ComposerXSettings } from '@/components/tradiespost/composer/ComposerXSettings'
import type { ComposerPlatformCopy } from '@/components/tradiespost/composer/useComposerPlatformCopy'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import { CAPTION_LIMITS } from '@/lib/tradiespost/composer/captionLimits'

const CAPTION_LABELS: Partial<Record<SocialPublishPlatform, string>> = {
  youtube: 'Description',
  pinterest: 'Pin description',
  gmb: 'Update text',
}

type Props = {
  platform: SocialPublishPlatform
  copy: ComposerPlatformCopy
  caption: string
  headline: string
  onHeadline: (value: string) => void
  xUsername: string | null
}

/** The text fields one platform uses: headline, title, tags and/or its own caption. */
export function ComposerPlatformCaptionFields({ platform, copy, caption, headline, onHeadline, xUsername }: Props) {
  if (platform === 'x') return <ComposerXSettings state={copy.x} username={xUsername} />

  return (
    <div className="space-y-4">
      {platform === 'facebook' && <ComposerHeadlineField value={headline} onChange={onHeadline} />}
      {platform === 'youtube' && <ComposerYouTubeTextFields state={copy.youtube} description={copy.captionFor('youtube')} />}
      {platform === 'pinterest' && <ComposerPinterestTitleField state={copy.pinterest} description={copy.captionFor('pinterest')} />}
      <ComposerOverrideTextarea
        id={`composer-caption-${platform}`}
        label={CAPTION_LABELS[platform] ?? 'Caption'}
        value={copy.overrides[platform] ?? ''}
        onChange={(value) => copy.setOverride(platform, value)}
        mainCaption={caption}
        limit={CAPTION_LIMITS[platform]}
      />
    </div>
  )
}

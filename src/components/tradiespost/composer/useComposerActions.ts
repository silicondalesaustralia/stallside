'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import type { ComposerMode } from '@/lib/tradiespost/composer/composerState'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import type { useComposerCaption } from '@/components/tradiespost/composer/useComposerCaption'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { ComposerYouTubeState } from '@/components/tradiespost/composer/useComposerYouTube'
import type { ComposerPinterestState } from '@/components/tradiespost/composer/useComposerPinterest'

/** "Write for me" and what happens after a post is sent or scheduled. */
export function useComposerActions(params: {
  captionState: ReturnType<typeof useComposerCaption>
  jobId: string | null
  media: ComposerMedia | null
  platforms: SocialPublishPlatform[]
  youtube: ComposerYouTubeState
  pinterest: ComposerPinterestState
  reload: () => void
  onFinished: () => void
}) {
  const { captionState, jobId, media, platforms, youtube, pinterest, reload, onFinished } = params
  const router = useRouter()
  const { toast } = useToast()

  const handleDone = useCallback(
    ({ mode }: { mode: ComposerMode }) => {
      onFinished()
      toast(mode === 'now' ? 'Posted' : 'Scheduled', 'success')
      reload()
      router.push('/dashboard/social/posts')
    },
    [onFinished, toast, reload, router],
  )

  const writeForMe = () =>
    void captionState
      .generate({ jobId, renderId: media?.renderId ?? null, assetId: media?.assetId ?? null, platform: platforms[0] })
      .then((written) => {
        if (written && pinterest.active) void pinterest.writeTitle(written.caption, jobId)
        if (written?.title) youtube.prefillTitle(written.title)
        if (written?.tags.length) youtube.prefillTags(written.tags)
      })

  return { handleDone, writeForMe }
}

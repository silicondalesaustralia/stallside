'use client'

import { useCallback, useState } from 'react'
import {
  submitLibraryPostNow,
  submitLibrarySchedule,
  type LibraryPostFetcher,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import type { ComposerMode } from '@/lib/tradiespost/composer/composerState'
import type { TikTokPostSettings } from '@/lib/social/tiktok/tiktokSettings'

const browserFetch: LibraryPostFetcher = async (url, init) => {
  const res = await fetch(url, init)
  return {
    ok: res.ok,
    status: res.status,
    json: async () => (await res.json().catch(() => ({}))) as Record<string, unknown>,
  }
}

export type ComposerSubmitInput = {
  mode: ComposerMode
  caption: string
  facebookCaption: string | null
  platforms: SocialPublishPlatform[]
  imageUrl: string
  jobId: string | null
  date: string
  time: string
  publishingMode: 'automatic' | 'manual'
  tiktokSettings: TikTokPostSettings | null
  video: { url: string; durationSeconds: number | null } | null
  tiktokSlides: string[] | null
}

export function useComposerSubmit(onDone: (result: { mode: ComposerMode }) => void) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submit = useCallback(
    async (input: ComposerSubmitInput) => {
      setSubmitting(true)
      setSubmitError(null)
      try {
        const base = {
          caption: input.caption,
          platforms: input.platforms,
          resultUrl: input.imageUrl,
          jobId: input.jobId,
          platformCaptions:
            input.facebookCaption && input.platforms.includes('facebook')
              ? { facebook: input.facebookCaption }
              : null,
          tiktokSettings: input.tiktokSettings,
          video: input.video,
          tiktokSlides: input.tiktokSlides,
        }
        if (input.mode === 'now') {
          await submitLibraryPostNow(base, browserFetch)
        } else {
          await submitLibrarySchedule(
            {
              ...base,
              scheduledDate: input.date,
              scheduledTime: input.time,
              publishingMode: input.publishingMode,
            },
            browserFetch,
          )
        }
        onDone({ mode: input.mode })
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSubmitting(false)
      }
    },
    [onDone],
  )

  return { submit, submitting, submitError }
}

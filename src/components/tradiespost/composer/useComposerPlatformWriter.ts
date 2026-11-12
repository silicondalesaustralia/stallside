'use client'

import { useState } from 'react'
import type { ComposerPlatformCopy } from '@/components/tradiespost/composer/useComposerPlatformCopy'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import type { SocialPublishPlatform } from '@/lib/social/libraryPublish'
import type { PlatformCaptionsResult } from '@/lib/social/platformCaptions/platformCaptionTypes'

export type WriteTarget = SocialPublishPlatform | 'all'

/** "Write all with AI" and each platform's "Write with AI": one request, results go into each platform's fields. */
export function useComposerPlatformWriter(params: {
  platforms: SocialPublishPlatform[]
  caption: string
  setCaption: (value: string) => void
  setHeadline: (value: string) => void
  jobId: string | null
  media: ComposerMedia | null
  copy: ComposerPlatformCopy
}) {
  const { platforms, caption, setCaption, setHeadline, jobId, media, copy } = params
  const [writing, setWriting] = useState<WriteTarget | null>(null)
  const [error, setError] = useState<{ target: WriteTarget; message: string } | null>(null)

  function apply(result: PlatformCaptionsResult) {
    if (result.main) setCaption(result.main)
    for (const platform of platforms) {
      const written = result.platforms[platform]
      if (!written) continue
      if (platform === 'x') {
        copy.x.setText(written.caption)
        continue
      }
      copy.setOverride(platform, written.caption)
      if (platform === 'facebook' && written.headline) setHeadline(written.headline)
      if (platform === 'youtube') {
        copy.youtube.setDraft((d) => ({
          ...d,
          title: written.title || d.title,
          tags: written.tags?.length ? written.tags.join(', ') : d.tags,
        }))
      }
      if (platform === 'pinterest' && written.title) {
        const title = written.title
        copy.pinterest.setDraft((d) => ({ ...d, title }))
      }
    }
  }

  async function write(target: WriteTarget) {
    const list = target === 'all' ? platforms : [target]
    if (!list.length) {
      setError({ target, message: 'Pick at least one platform first.' })
      return
    }
    setWriting(target)
    setError(null)
    try {
      const res = await fetch('/api/social/generate-platform-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: list,
          includeMain: target === 'all' && !caption.trim(),
          mainCaption: caption,
          jobId,
          renderId: media?.renderId ?? null,
          assetId: media?.assetId ?? null,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as Partial<PlatformCaptionsResult> & { error?: string }
      if (!res.ok || !json.platforms) throw new Error(json.error || `Writing failed (${res.status})`)
      apply({ main: json.main ?? null, platforms: json.platforms })
    } catch (err) {
      console.error('[Platform captions]', err)
      setError({ target, message: err instanceof Error ? err.message : 'Could not write the captions' })
    } finally {
      setWriting(null)
    }
  }

  return { writing, error, write }
}

export type ComposerPlatformWriter = ReturnType<typeof useComposerPlatformWriter>

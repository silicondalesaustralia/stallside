'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useTradiesPostSocialWorkspace } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostPageHeader } from '@/components/tradiespost/ui'
import { SocialTabLoading } from '@/components/social/SocialTabPanel'
import { SocialJobPicker } from '@/components/social/SocialJobPicker'
import { ComposerStep } from '@/components/tradiespost/composer/ComposerStep'
import { ComposerPlatformChips } from '@/components/tradiespost/composer/ComposerPlatformChips'
import { ComposerMediaPicker } from '@/components/tradiespost/composer/ComposerMediaPicker'
import { ComposerCaptionStep } from '@/components/tradiespost/composer/ComposerCaptionStep'
import { ComposerSidePanel } from '@/components/tradiespost/composer/ComposerSidePanel'
import { ComposerAiStudioDrawer } from '@/components/tradiespost/composer/ComposerAiStudioDrawer'
import { useComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import { useComposerCaption } from '@/components/tradiespost/composer/useComposerCaption'
import { useComposerTikTokGate } from '@/components/tradiespost/composer/useComposerTikTok'
import { ComposerTikTokSettings } from '@/components/tradiespost/composer/ComposerTikTokSettings'
import { ComposerTikTokSlides } from '@/components/tradiespost/composer/ComposerTikTokSlides'
import {
  defaultLibrarySelectedPlatforms,
  socialConnectionsFromBusiness,
  toggleLibraryPlatform,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { isAiPhotoSource } from '@/lib/tradiespost/composer/composerState'
import { mediaFromSavedPost } from '@/lib/tradiespost/composer/composerSlides'
import { postImageUrl } from '@/lib/tradiespost/posts/derivePostOutcome'

export function TradiesPostComposer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const ctx = useTradiesPostSocialWorkspace()
  const connected = useMemo(() => socialConnectionsFromBusiness(ctx.business), [ctx.business])

  const [platforms, setPlatforms] = useState<SocialPublishPlatform[]>([])
  const [jobId, setJobId] = useState<string | null>(searchParams.get('jobId'))
  const [aiOpen, setAiOpen] = useState(false)
  const [headline, setHeadline] = useState('')
  const { media, setMedia, uploading, uploadError, upload } = useComposerMedia()
  const captionState = useComposerCaption()
  const videoDuration = media?.video?.durationSeconds ?? null
  const tiktok = useComposerTikTokGate(platforms.includes('tiktok') && connected.tiktok, videoDuration)
  const { setCaption } = captionState
  const platformsInitRef = useRef(false)
  const duplicateAppliedRef = useRef(false)

  useEffect(() => {
    if (platformsInitRef.current || !ctx.business) return
    platformsInitRef.current = true
    setPlatforms(defaultLibrarySelectedPlatforms(connected))
  }, [ctx.business, connected])

  useEffect(() => {
    const fromPost = searchParams.get('fromPost')
    if (!fromPost || duplicateAppliedRef.current || !ctx.posts.length) return
    const source = ctx.posts.find((p) => p.id === fromPost)
    if (!source) return
    duplicateAppliedRef.current = true
    setCaption(source.caption ?? '')
    setMedia(mediaFromSavedPost(postImageUrl(source), source.processed_photo_urls))
  }, [searchParams, ctx.posts, setCaption, setMedia])

  const handleDone = useCallback(
    ({ mode }: { mode: 'now' | 'schedule' }) => {
      toast(mode === 'now' ? 'Posted' : 'Scheduled', 'success')
      void ctx.loadData({ force: true })
      router.push('/dashboard/social/posts')
    },
    [toast, ctx, router],
  )

  if (ctx.loading && !ctx.business) return <SocialTabLoading variant="tradiespost" />

  const writeForMe = () =>
    void captionState.generate({ jobId, renderId: media?.renderId ?? null, platform: platforms[0] })

  return (
    <TradiesPostAppPage maxWidth="2xl">
      <TradiesPostPageHeader title="Create a post" subtitle="Pick where, add an image, write a caption. Done." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <ComposerStep number={1} title="Where should it go?">
            <ComposerPlatformChips
              selected={platforms}
              connected={connected}
              onToggle={(p) => setPlatforms((prev) => toggleLibraryPlatform(prev, p))}
            />
          </ComposerStep>
          <ComposerStep number={2} title="Add a photo or video">
            <div className="mb-4 max-w-md">
              <SocialJobPicker
                value={jobId}
                onChange={(id) => setJobId(id)}
                helperText="Linking a job helps the AI write about the right work and suburb."
              />
            </div>
            <ComposerMediaPicker
              media={media}
              uploading={uploading}
              uploadError={uploadError}
              onUpload={(file) => void upload(file)}
              onSelectLibrary={setMedia}
              onOpenAi={() => setAiOpen(true)}
              onRemove={() => setMedia(null)}
              photoExtras={platforms.includes('tiktok') && (
                <ComposerTikTokSlides media={media} setMedia={setMedia} jobId={jobId}
                  onSuggestedCaption={(c) => { if (!captionState.caption.trim()) setCaption(c) }} />
              )}
            />
          </ComposerStep>
          <ComposerCaptionStep
            platforms={platforms}
            headline={headline}
            onHeadline={setHeadline}
            captionState={captionState}
            onWriteForMe={writeForMe}
          />
          {tiktok.active && (
            <ComposerStep number={4} title="TikTok settings">
              <ComposerTikTokSettings state={tiktok.state} isVideo={Boolean(media?.video)} videoDurationSeconds={videoDuration} />
            </ComposerStep>
          )}
        </div>
        <ComposerSidePanel
          business={ctx.business}
          platforms={platforms}
          connected={connected}
          media={media}
          caption={captionState.caption}
          headline={platforms.includes('facebook') ? headline : ''}
          jobId={jobId}
          tiktokSettings={tiktok.settings}
          tiktokBlockReason={tiktok.blockReason}
          onDone={handleDone}
        />
      </div>
      <ComposerAiStudioDrawer
        open={aiOpen}
        jobId={jobId}
        onClose={() => setAiOpen(false)}
        onPicked={(render) => {
          setMedia({ url: render.result_url, renderId: render.id, aiGenerated: isAiPhotoSource(render.photo_source) })
          setAiOpen(false)
          void ctx.loadData({ force: true })
        }}
      />
    </TradiesPostAppPage>
  )
}

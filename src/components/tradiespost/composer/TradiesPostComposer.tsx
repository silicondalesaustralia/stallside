'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { ComposerTikTokSlides } from '@/components/tradiespost/composer/ComposerTikTokSlides'
import { ComposerSlideshow } from '@/components/social/slideshow/ComposerSlideshow'
import { ComposerMusicPanel } from '@/components/tradiespost/composer/ComposerMusicPanel'
import { useComposerPlatformCopy } from '@/components/tradiespost/composer/useComposerPlatformCopy'
import { useComposerPlatformWriter } from '@/components/tradiespost/composer/useComposerPlatformWriter'
import { ComposerPlatformSettingsSteps } from '@/components/tradiespost/composer/ComposerPlatformSettingsSteps'
import { useComposerStartState } from '@/components/tradiespost/composer/useComposerStartState'
import { useComposerLinkedItem } from '@/components/tradiespost/composer/useComposerLinkedItem'
import { useComposerActions } from '@/components/tradiespost/composer/useComposerActions'
import { useComposerDraftState } from '@/components/tradiespost/composer/useComposerDraftState'
import { ComposerDraftBanner } from '@/components/tradiespost/composer/ComposerDraftBanner'
import { ComposerDraftButton } from '@/components/tradiespost/composer/ComposerDraftButton'
import {
  socialConnectionsFromBusiness,
  toggleLibraryPlatform,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { isAiPhotoSource } from '@/lib/tradiespost/composer/composerState'

export function TradiesPostComposer() {
  const searchParams = useSearchParams()
  const ctx = useTradiesPostSocialWorkspace()
  const connected = useMemo(() => socialConnectionsFromBusiness(ctx.business), [ctx.business])

  const [platforms, setPlatforms] = useState<SocialPublishPlatform[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [headline, setHeadline] = useState('')
  const { media, setMedia, uploading, uploadError, upload } = useComposerMedia()
  const { jobId, onJobChange, restoreJob, linkedImages, linkedUrl } = useComposerLinkedItem({ initialJobId: searchParams.get('jobId'), media, setMedia })
  const captionState = useComposerCaption()
  const videoDuration = media?.video?.durationSeconds ?? null
  const tiktok = useComposerTikTokGate(platforms.includes('tiktok') && connected.tiktok, videoDuration)
  const copy = useComposerPlatformCopy({ platforms, connected, caption: captionState.caption, linkedUrl })
  const { youtube, pinterest, x } = copy
  const gates = { tiktok, youtube, pinterest, x }
  const { setCaption } = captionState
  const suggestCaption = (c: string) => !captionState.caption.trim() && setCaption(c)
  useComposerStartState({ business: ctx.business, posts: ctx.posts, connected, setPlatforms, setCaption, setMedia })
  const drafts = useComposerDraftState({ businessId: ctx.business?.id ?? null,
    platforms: { value: platforms, set: setPlatforms }, headline: { value: headline, set: setHeadline },
    caption: { value: captionState.caption, set: setCaption }, platformText: { value: copy.text, set: copy.applyText },
    media: { value: media, set: setMedia }, jobId: { value: jobId, set: restoreJob } })
  const { draft } = drafts
  const writer = useComposerPlatformWriter({ platforms, caption: captionState.caption, setCaption, setHeadline, jobId, media, copy })
  const { handleDone, writeForMe } = useComposerActions({ captionState, jobId, media, platforms, youtube, pinterest,
    reload: () => void ctx.loadData({ force: true }), onFinished: draft.finish })

  if (ctx.loading && !ctx.business) return <SocialTabLoading variant="tradiespost" />

  return (
    <TradiesPostAppPage maxWidth="2xl">
      <TradiesPostPageHeader title="Create a post" subtitle="Pick where, add an image, write a caption. Done." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <ComposerDraftBanner restored={draft.restored} onStartFresh={drafts.startFresh} onDismiss={draft.dismiss} />
          <ComposerStep number={1} title="Where should it go?">
            <ComposerPlatformChips selected={platforms} connected={connected}
              onToggle={(p) => setPlatforms((prev) => toggleLibraryPlatform(prev, p))} />
          </ComposerStep>
          <ComposerStep number={2} title="Add a photo, video or slideshow">
            <div className="mb-4 max-w-md">
              <SocialJobPicker
                value={jobId}
                onChange={onJobChange}
                helperText="Pick a product, pre-order page or subscription and the AI will write about it and can use its photos."
              />
            </div>
            <ComposerMediaPicker
              key={drafts.restoreKey}
              initialKind={drafts.initialKind}
              media={media}
              uploading={uploading}
              uploadError={uploadError}
              onUpload={(file) => void upload(file)}
              onSelectLibrary={setMedia}
              onOpenAi={() => setAiOpen(true)}
              onRemove={() => setMedia(null)}
              linkedImages={linkedImages}
              photoExtras={platforms.includes('tiktok') && (
                <ComposerTikTokSlides media={media} setMedia={setMedia} />
              )}
              slideshow={<ComposerSlideshow jobId={jobId} linkedImages={linkedImages} business={ctx.business}
                tiktokSelected={platforms.includes('tiktok')} onMedia={setMedia} onSuggestedCaption={suggestCaption}
                saved={drafts.slideshow} onDraft={drafts.setSlideshow} />}
            />
            <ComposerMusicPanel media={media} setMedia={setMedia} />
          </ComposerStep>
          <ComposerCaptionStep platforms={platforms} headline={headline} onHeadline={setHeadline} captionState={captionState}
            onWriteForMe={writeForMe} copy={copy} writer={writer} xUsername={ctx.business?.x_username ?? null} />
          <ComposerPlatformSettingsSteps
            gates={gates}
            isVideo={Boolean(media?.video)}
            videoDurationSeconds={videoDuration}
            youtubeChannelTitle={ctx.business?.youtube_channel_title ?? null}
            pinterestUsername={ctx.business?.pinterest_username ?? null}
          />
        </div>
        <ComposerSidePanel
          business={ctx.business}
          platforms={platforms}
          connected={connected}
          media={media}
          caption={captionState.caption}
          overrides={copy.overrides}
          headline={platforms.includes('facebook') ? headline : ''}
          jobId={jobId}
          gates={gates}
          onDone={handleDone}
          draftAction={<ComposerDraftButton saving={draft.saving} savedAt={draft.savedAt} error={draft.error} onSave={() => void draft.save()} />}
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

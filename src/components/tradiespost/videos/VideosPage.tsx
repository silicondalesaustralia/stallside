'use client'

import { useState } from 'react'
import { Clapperboard, Loader2, Upload } from 'lucide-react'
import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import {
  TradiesPostButtonLight,
  TradiesPostEmptyState,
  TradiesPostPageHeader,
} from '@/components/tradiespost/ui'
import { VideoSourceCard } from './VideoSourceCard'
import { VideoSourceUploadModal } from './VideoSourceUploadModal'
import { useVideoSources } from './useVideoSources'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'

export function VideosPage() {
  const { sources, loading, error, refresh } = useVideoSources()
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <TradiesPostAppPage maxWidth="2xl">
      <TradiesPostPageHeader
        title="Videos"
        subtitle="Upload a video and we'll cut it into short clips — or keep the whole video and add captions and text yourself. Everything is saved to your Library, ready to post from Create."
        action={
          sources.length ? (
            <div className="flex flex-wrap gap-2">
              <TradiesPostButtonLight variant="secondary" href={SOCIAL_PATHS.library}>
                View Library
              </TradiesPostButtonLight>
              <TradiesPostButtonLight
                onClick={() => setUploadOpen(true)}
                iconLeft={<Upload className="h-4 w-4" />}
              >
                Upload video
              </TradiesPostButtonLight>
            </div>
          ) : null
        }
      />

      {loading ? (
        <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-tradiespost-gold" />
      ) : error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : sources.length === 0 ? (
        <TradiesPostEmptyState
          icon={Clapperboard}
          title="Turn one video into a week of posts"
          description="Upload a farm or kitchen tour, a harvest or bake day, or a quick product explainer (up to 30 minutes). We'll find the best moments and save them as short clips, or you can keep the whole video and edit it."
          actionLabel="Upload video"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {sources.map((source) => (
            <VideoSourceCard key={source.id} source={source} onChanged={() => void refresh()} />
          ))}
        </div>
      )}

      <VideoSourceUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => void refresh()}
      />
    </TradiesPostAppPage>
  )
}

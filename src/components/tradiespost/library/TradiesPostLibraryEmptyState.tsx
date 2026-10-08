'use client'

import Image from 'next/image'
import { TP_ASSETS } from '@/lib/tradiespost/assets'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui/TradiesPostButton'
import { TradiesPostCard } from '@/components/tradiespost/ui'

type TradiesPostLibraryEmptyStateProps = {
  createHref?: string
  plannerHref?: string
  onUploadVideo?: () => void
  filtered?: boolean
}

export function TradiesPostLibraryEmptyState({
  createHref = '/dashboard/social/create',
  plannerHref = '/dashboard/social/planner?buildWeek=1',
  onUploadVideo,
  filtered = false,
}: TradiesPostLibraryEmptyStateProps) {
  return (
    <TradiesPostCard padding="lg" className="mx-auto max-w-md text-center" data-testid="tp-library-empty">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
        <Image
          src={TP_ASSETS.howBuddyBuilds}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
          aria-hidden
        />
      </div>
      <h3 className="text-lg font-black text-[#18181B]">
        {filtered ? 'No matches in this filter' : 'Your library is empty'}
      </h3>
      <p className="mt-2 text-sm text-zinc-600">
        {filtered
          ? 'Try another filter or create fresh content.'
          : 'Create your first post - or let Buddy build your week.'}
      </p>
      {!filtered && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <TradiesPostButtonLight href={createHref} variant="primary" size="md">
            Create
          </TradiesPostButtonLight>
          <TradiesPostButtonLight href={plannerHref} variant="secondary" size="md">
            Build My Week
          </TradiesPostButtonLight>
        </div>
      )}
      {!filtered && onUploadVideo && (
        <button
          type="button"
          onClick={onUploadVideo}
          className="mt-4 text-sm font-semibold text-zinc-600 underline decoration-[#F5C518]/60 hover:text-[#18181B]"
        >
          Upload a video
        </button>
      )}
    </TradiesPostCard>
  )
}

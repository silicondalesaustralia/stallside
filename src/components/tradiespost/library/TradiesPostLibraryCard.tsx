'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CalendarPlus,
  Copy,
  Download,
  Eye,
  Film,
  ImageIcon,
  MessageSquare,
  MoreVertical,
  Send,
  Trash2,
} from 'lucide-react'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'
import { TradiesPostLibraryPostNowModal } from '@/components/tradiespost/library/TradiesPostLibraryPostNowModal'
import type { TradiesPostLibraryCardModel } from '@/lib/tradiespost/libraryViewModel'
import type { TradiesPostStatus } from '@/lib/tradiespost/status'
import type { SocialConnectionState, SocialPublishPlatform } from '@/lib/social/libraryPublish'

type TradiesPostLibraryCardProps = {
  model: TradiesPostLibraryCardModel
  selected?: boolean
  connected?: SocialConnectionState
  onView: () => void
  onSchedule?: () => void
  onPostNow?: (platforms: SocialPublishPlatform[]) => void | Promise<boolean | void>
  onDownload?: () => void
  onCopyCaption?: () => void
  onDelete?: () => void
  canPostNow?: boolean
  canSchedule?: boolean
  canCopyCaption?: boolean
  postNowSubmitting?: boolean
  postNowError?: string | null
}

function postLinkBadge(status: TradiesPostLibraryCardModel['postLinkStatus']): {
  status: TradiesPostStatus
  label: string
} | null {
  if (status === 'scheduled') return { status: 'scheduled', label: 'Scheduled' }
  if (status === 'published') return { status: 'published', label: 'Published' }
  return null
}

export function TradiesPostLibraryCard({
  model,
  selected = false,
  connected,
  onView,
  onSchedule,
  onPostNow,
  onDownload,
  onCopyCaption,
  onDelete,
  canPostNow = false,
  canSchedule = false,
  canCopyCaption = false,
  postNowSubmitting = false,
  postNowError = null,
}: TradiesPostLibraryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [postNowOpen, setPostNowOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const postBadge = postLinkBadge(model.postLinkStatus)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  const primaryAction =
    model.mediaKind === 'image' && canSchedule
      ? { label: 'Schedule', Icon: CalendarPlus, onClick: onSchedule }
      : { label: 'View', Icon: Eye, onClick: onView }

  const PrimaryIcon = primaryAction.Icon
  const emptyConnected: SocialConnectionState = {
    facebook: false,
    instagram: false,
    gmb: false,
    tiktok: false,
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
        selected ? 'border-[#F5C518] ring-1 ring-[#F5C518]/30' : 'border-zinc-200'
      }`}
      data-testid={`tp-library-card-${model.id}`}
    >
      <button
        type="button"
        onClick={onView}
        className="relative block w-full overflow-hidden bg-zinc-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
        aria-label={`View ${model.creationLabel}`}
      >
        <div className="aspect-[4/5] w-full sm:aspect-square">
          {model.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100">
              {model.mediaKind === 'video' ? (
                <Film className="h-10 w-10 text-zinc-400" />
              ) : (
                <ImageIcon className="h-10 w-10 text-zinc-400" />
              )}
            </div>
          )}
        </div>
        {model.mediaKind === 'video' && model.durationLabel ? (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {model.durationLabel}
          </span>
        ) : null}
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
          {model.creationLabel}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <TradiesPostStatusBadge
            status="ready"
            label={model.assetStatusLabel}
            dot
            className="origin-left scale-90"
          />
          {postBadge ? (
            <TradiesPostStatusBadge
              status={postBadge.status}
              label={postBadge.label}
              dot
              className="origin-left scale-90"
            />
          ) : null}
          {model.hasCaption ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-600">
              <MessageSquare className="h-2.5 w-2.5" aria-hidden />
              Caption
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug text-zinc-800">
          {model.captionPreview.trim() || 'No caption yet'}
        </p>

        <p className="text-[10px] font-medium tabular-nums text-zinc-500">{model.createdLabel}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-xl bg-[#18181B] px-2.5 py-2 text-[11px] font-bold text-white hover:bg-zinc-800"
          >
            <PrimaryIcon className="h-3.5 w-3.5" />
            {primaryAction.label}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              aria-label="More actions"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute bottom-full right-0 z-20 mb-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                <MenuItem icon={Eye} label="View" onClick={() => { setMenuOpen(false); onView() }} />
                {canSchedule && onSchedule ? (
                  <MenuItem
                    icon={CalendarPlus}
                    label="Add to Calendar"
                    onClick={() => { setMenuOpen(false); onSchedule() }}
                  />
                ) : null}
                {canPostNow && onPostNow ? (
                  <MenuItem
                    icon={Send}
                    label="Post now"
                    onClick={() => {
                      setMenuOpen(false)
                      setPostNowOpen(true)
                    }}
                  />
                ) : null}
                {onDownload ? (
                  <MenuItem
                    icon={Download}
                    label="Download"
                    onClick={() => { setMenuOpen(false); onDownload() }}
                  />
                ) : null}
                {canCopyCaption && onCopyCaption ? (
                  <MenuItem
                    icon={Copy}
                    label="Copy caption"
                    onClick={() => { setMenuOpen(false); onCopyCaption() }}
                  />
                ) : null}
                {onDelete ? (
                  <MenuItem
                    icon={Trash2}
                    label="Delete"
                    destructive
                    onClick={() => { setMenuOpen(false); onDelete() }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {onPostNow ? (
        <TradiesPostLibraryPostNowModal
          open={postNowOpen}
          onClose={() => {
            if (!postNowSubmitting) setPostNowOpen(false)
          }}
          connected={connected ?? emptyConnected}
          submitting={postNowSubmitting}
          error={postNowError}
          onConfirm={(platforms) => {
            void (async () => {
              const result = await onPostNow(platforms)
              if (result !== false) setPostNowOpen(false)
            })()
          }}
        />
      ) : null}
    </article>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: typeof Eye
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-zinc-50 ${
        destructive ? 'text-red-600' : 'text-zinc-700'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

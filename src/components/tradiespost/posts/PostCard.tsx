'use client'

import Link from 'next/link'
import { Copy, ImageIcon, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'
import { PostPlatformIcons } from '@/components/tradiespost/posts/PostPlatformIcons'
import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import { SOCIAL_PUBLISH_PLATFORM_LABELS } from '@/lib/social/libraryPublish'
import { calendarPostTitle } from '@/lib/social/socialCalendar'
import {
  OVERALL_BADGE,
  overallStatus,
  platformOutcomes,
  postImageUrl,
} from '@/lib/tradiespost/posts/derivePostOutcome'

type Props = {
  post: SocialWorkspacePost
  timeZone: string
  busy: boolean
  onRetry: (id: string) => void
  onCancel: (id: string) => void
}

function formatWhen(post: SocialWorkspacePost, timeZone: string): string {
  const iso = post.posted_at || post.scheduled_for || post.created_at
  return new Intl.DateTimeFormat('en-AU', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

const actionBtn =
  'inline-flex items-center gap-1 rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-xs font-bold text-[#18181B] hover:border-[#F5C518] disabled:opacity-50'

export function PostCard({ post, timeZone, busy, onRetry, onCancel }: Props) {
  const status = overallStatus(post)
  const badge = OVERALL_BADGE[status]
  const outcomes = platformOutcomes(post)
  const failures = outcomes.filter((o) => o.outcome === 'failed')
  const image = postImageUrl(post)
  const canRetry = status === 'failed' || status === 'needs_attention'

  return (
    <div className="flex gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4" data-testid={`post-card-${post.id}`}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100">
          <ImageIcon className="h-5 w-5 text-zinc-300" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <TradiesPostStatusBadge status={badge.status} label={badge.label} dot />
          {post.publishing_mode === 'manual' && status === 'scheduled' && (
            <span className="text-[10px] font-semibold text-zinc-500">Post manually</span>
          )}
          <PostPlatformIcons outcomes={outcomes} />
        </div>
        <p className="truncate text-sm font-semibold text-[#18181B]">{calendarPostTitle(post.caption)}</p>
        <p className="text-xs text-zinc-500">{formatWhen(post, timeZone)}</p>
        {failures.map((f) => (
          <p key={f.platform} className="mt-1 text-xs text-red-600">
            {SOCIAL_PUBLISH_PLATFORM_LABELS[f.platform]}: {f.error}
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {canRetry && (
            <button type="button" className={actionBtn} disabled={busy} onClick={() => onRetry(post.id)}>
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Retry
            </button>
          )}
          {status === 'scheduled' && (
            <button type="button" className={actionBtn} disabled={busy} onClick={() => onCancel(post.id)}>
              <XCircle className="h-3 w-3" /> Cancel
            </button>
          )}
          <Link href={`/dashboard/social/create?fromPost=${post.id}`} className={actionBtn}>
            <Copy className="h-3 w-3" /> Duplicate
          </Link>
        </div>
      </div>
    </div>
  )
}

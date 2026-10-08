'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useTradiesPostSocialWorkspace } from '@/components/tradiespost/TradiesPostSocialWorkspaceProvider'
import { TradiesPostAppPage } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostButtonLight, TradiesPostPageHeader } from '@/components/tradiespost/ui'
import { SocialTabLoading } from '@/components/social/SocialTabPanel'
import { PostsFilterChips } from '@/components/tradiespost/posts/PostsFilterChips'
import { PostCard } from '@/components/tradiespost/posts/PostCard'
import { resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import {
  matchesFilter,
  postSortTime,
  type PostsFilter,
} from '@/lib/tradiespost/posts/derivePostOutcome'

const ALL_FILTERS: PostsFilter[] = ['all', 'scheduled', 'posted', 'needs_attention']

type ActionResponse = {
  error?: string
  status?: string
  results?: Record<string, { success?: boolean; error?: string } | undefined>
}

async function postAction(url: string): Promise<void> {
  const res = await fetch(url, { method: 'POST' })
  const json = (await res.json().catch(() => ({}))) as ActionResponse
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  if (json.status === 'failed') {
    const firstError = Object.values(json.results ?? {}).find((r) => r && !r.success)?.error
    throw new Error(firstError || 'Post failed again')
  }
}

export function TradiesPostPostsPage() {
  const { toast } = useToast()
  const ctx = useTradiesPostSocialWorkspace()
  const { loadData } = ctx
  const [filter, setFilter] = useState<PostsFilter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void loadData({ force: true })
  }, [loadData])

  const visiblePosts = useMemo(
    () => ctx.posts.filter((p) => p.status !== 'cancelled' && p.status !== 'draft'),
    [ctx.posts],
  )
  const counts = useMemo(() => {
    const entries = ALL_FILTERS.map((f) => [f, visiblePosts.filter((p) => matchesFilter(p, f)).length])
    return Object.fromEntries(entries) as Record<PostsFilter, number>
  }, [visiblePosts])
  const shown = useMemo(
    () => visiblePosts.filter((p) => matchesFilter(p, filter)).sort((a, b) => postSortTime(b) - postSortTime(a)),
    [visiblePosts, filter],
  )

  if (ctx.loading && !ctx.business) return <SocialTabLoading variant="tradiespost" />

  const timeZone = resolveBusinessTimeZone(ctx.business?.timezone)

  async function run(id: string, url: string, success: string) {
    setBusyId(id)
    try {
      await postAction(url)
      toast(success, 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setBusyId(null)
      void loadData({ force: true })
    }
  }

  return (
    <TradiesPostAppPage maxWidth="lg">
      <TradiesPostPageHeader
        title="Posts"
        subtitle="Everything you've posted or scheduled, and whether it worked."
        action={
          <TradiesPostButtonLight href="/dashboard/social/create" variant="primary" size="md" iconLeft={<Plus className="h-4 w-4" />}>
            Create post
          </TradiesPostButtonLight>
        }
      />
      {ctx.loadError && <p className="mb-4 text-sm font-semibold text-red-600">{ctx.loadError}</p>}
      <PostsFilterChips value={filter} counts={counts} onChange={setFilter} />
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E4E4E7] bg-white p-10 text-center">
          <p className="text-sm font-bold text-[#18181B]">Nothing here yet</p>
          <p className="mt-1 text-xs text-zinc-500">Posts show up here once they&apos;re posted or scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              timeZone={timeZone}
              busy={busyId === post.id}
              onRetry={(id) => void run(id, `/api/social/posts/${id}/publish`, 'Retrying post')}
              onCancel={(id) => void run(id, `/api/social/posts/${id}/cancel`, 'Scheduled post cancelled')}
            />
          ))}
        </div>
      )}
    </TradiesPostAppPage>
  )
}

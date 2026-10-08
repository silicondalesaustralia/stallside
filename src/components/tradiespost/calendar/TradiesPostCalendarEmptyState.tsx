'use client'

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui/TradiesPostButton'
import { TradiesPostCard } from '@/components/tradiespost/ui'

type TradiesPostCalendarEmptyStateProps = {
  plannerHref?: string
  createHref?: string
}

export function TradiesPostCalendarEmptyState({
  plannerHref = '/dashboard/social/planner?buildWeek=1',
  createHref = '/dashboard/social/create',
}: TradiesPostCalendarEmptyStateProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4"
      aria-hidden={false}
    >
      <TradiesPostCard
        padding="lg"
        className="pointer-events-auto max-w-md text-center shadow-lg"
        data-testid="tp-calendar-empty"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5C518]/15">
          <CalendarDays className="h-7 w-7 text-[#B8860B]" aria-hidden />
        </div>
        <h3 className="text-lg font-black text-[#18181B]">Nothing scheduled yet</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Let&apos;s get your socials sorted - plan your month or create a post now.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <TradiesPostButtonLight href={plannerHref} variant="primary" size="md">
            Build My Week
          </TradiesPostButtonLight>
          <TradiesPostButtonLight href={createHref} variant="secondary" size="md">
            Create a Post
          </TradiesPostButtonLight>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Build My Week fills your month one week at a time - same planner you already use.
        </p>
      </TradiesPostCard>
    </div>
  )
}

export function TradiesPostCalendarEmptyHint({
  plannerHref = '/dashboard/social/planner?buildWeek=1',
  createHref = '/dashboard/social/create',
}: TradiesPostCalendarEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-[#FAFAFA] px-4 py-6 text-center">
      <p className="text-sm font-semibold text-[#18181B]">Nothing scheduled yet</p>
      <p className="mt-1 text-sm text-zinc-600">Let&apos;s get your socials sorted.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <Link href={plannerHref} className="text-[#18181B] underline decoration-[#F5C518]/60">
          Build My Week
        </Link>
        <Link href={createHref} className="text-[#18181B] underline decoration-[#F5C518]/60">
          Create a Post
        </Link>
      </div>
    </div>
  )
}

'use client'

import type { PostsFilter } from '@/lib/tradiespost/posts/derivePostOutcome'

const FILTERS: { id: PostsFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'posted', label: 'Posted' },
  { id: 'needs_attention', label: 'Needs attention' },
]

type Props = {
  value: PostsFilter
  counts: Record<PostsFilter, number>
  onChange: (filter: PostsFilter) => void
}

export function PostsFilterChips({ value, counts, onChange }: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" data-testid="posts-filters">
      {FILTERS.map((f) => {
        const active = value === f.id
        const alert = f.id === 'needs_attention' && counts.needs_attention > 0
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
              active ? 'border-[#18181B] bg-[#18181B] text-white' : 'border-[#E4E4E7] bg-white text-zinc-600'
            }`}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                alert ? 'bg-red-600 text-white' : active ? 'bg-white/20' : 'bg-zinc-100'
              }`}
            >
              {counts[f.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

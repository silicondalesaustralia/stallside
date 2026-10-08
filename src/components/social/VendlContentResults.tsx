'use client'

import { VENDL_CONTENT_KIND_LABEL, type VendlContentItem } from '@/lib/socialHost/vendlContentTypes'

type Props = {
  items: VendlContentItem[]
  loading: boolean
  error: string | null
  query: string
  onPick: (item: VendlContentItem) => void
}

export default function VendlContentResults({ items, loading, error, query, onPick }: Props) {
  if (error) return <p className="px-3 py-3 text-xs text-[#B42318]">{error}</p>
  if (loading && !items.length) return <p className="px-3 py-3 text-xs text-[#888]">Searching…</p>
  if (!items.length) {
    return (
      <p className="px-3 py-3 text-xs text-[#888]">
        {query.trim() ? `Nothing matches “${query.trim()}”.` : 'No products, pre-order pages or subscriptions yet.'}
      </p>
    )
  }

  return (
    <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
      {items.map((item) => (
        <li key={item.ref}>
          <button
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => onPick(item)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#FAFAF8]"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="size-10 shrink-0 rounded-lg bg-[#F0EFEB]" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[#333]">{item.title}</span>
              <span className="block truncate text-xs text-[#888]">
                {VENDL_CONTENT_KIND_LABEL[item.kind]}
                {item.subtitle ? ` · ${item.subtitle}` : ''}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

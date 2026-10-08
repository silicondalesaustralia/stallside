'use client'

import { Plus, Search, Video, X } from 'lucide-react'
import {
  TRADIESPOST_LIBRARY_FILTERS,
  type TradiesPostLibraryFilter,
} from '@/lib/tradiespost/libraryViewModel'

type TradiesPostLibraryToolbarProps = {
  filter: TradiesPostLibraryFilter
  onFilterChange: (filter: TradiesPostLibraryFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  itemCount: number
  onAddMenuToggle: () => void
  addMenuOpen: boolean
  onUploadVideo: () => void
}

export function TradiesPostLibraryToolbar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  itemCount,
  onAddMenuToggle,
  addMenuOpen,
  onUploadVideo,
}: TradiesPostLibraryToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Library</p>
          <h2 className="text-lg font-black text-[#18181B] sm:text-xl">
            {itemCount} asset{itemCount === 1 ? '' : 's'}
          </h2>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onAddMenuToggle}
            className="inline-flex items-center gap-2 rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800"
            data-testid="library-add-content"
          >
            <Plus className="h-4 w-4" />
            Add content
          </button>
          {addMenuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close menu"
                onClick={onAddMenuToggle}
              />
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onAddMenuToggle()
                    onUploadVideo()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-[#333] hover:bg-zinc-50"
                  data-testid="library-upload-video"
                >
                  <Video className="h-4 w-4 text-zinc-500" />
                  Upload video
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search captions and types…"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm text-[#18181B] placeholder:text-zinc-400 focus:border-[#F5C518] focus:outline-none focus:ring-1 focus:ring-[#F5C518]/40"
          data-testid="tp-library-search"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRADIESPOST_LIBRARY_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === id
                ? 'bg-[#F5C518] text-[#18181B]'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-[#18181B]'
            }`}
            data-testid={`tp-library-filter-${id}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import type { HybridRenderListItem } from '@/lib/social/libraryRenderUtils'

type Props = {
  onSelect: (render: HybridRenderListItem) => void
  onCancel: () => void
}

export function ComposerLibraryPicker({ onSelect, onCancel }: Props) {
  const [renders, setRenders] = useState<HybridRenderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/social/hybrid-renders?limit=50&status=completed')
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      const json = (await res.json()) as { renders?: HybridRenderListItem[] }
      setRenders((json.renders ?? []).filter((r) => r.result_url))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-3" data-testid="composer-library-picker">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-600">Pick a finished image from your Library</p>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-zinc-500 hover:underline">
          Cancel
        </button>
      </div>
      {loading && (
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading your library…
        </p>
      )}
      {!loading && error && (
        <div className="text-center">
          <p className="mb-2 text-xs text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-xs font-bold"
          >
            <RefreshCw className="h-3 w-3" /> Try again
          </button>
        </div>
      )}
      {!loading && !error && renders.length === 0 && (
        <div className="py-4 text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
          <p className="text-xs text-zinc-500">No finished images yet. Use Create with AI to make one.</p>
        </div>
      )}
      {!loading && !error && renders.length > 0 && (
        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {renders.map((render) => (
            <button
              key={render.id}
              type="button"
              onClick={() => onSelect(render)}
              className="aspect-square overflow-hidden rounded-lg border-2 border-[#E4E4E7] hover:border-[#F5C518]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={render.result_url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

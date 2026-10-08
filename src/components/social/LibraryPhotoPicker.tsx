'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import { ImageExpandTrigger } from '@/components/ui/ClickToExpandImage'
import { FORMAT_ACCENTS } from '@/lib/social/socialDesignTokens'
import {
  formatPresetKey,
  formatPresetLabel,
  platformSizeLabel,
  reusablePhotoUrl,
  type HybridRenderListItem,
} from '@/lib/social/libraryRenderUtils'

export function LibraryPhotoPicker({
  selectedUrl,
  onSelect,
}: {
  selectedUrl: string
  onSelect: (url: string, renderId: string) => void
}) {
  const [renders, setRenders] = useState<HybridRenderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadRenders = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const res = await fetch(
        '/api/social/hybrid-renders?limit=50&status=completed&reusableOnly=true',
      )
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setRenders(json.renders || [])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRenders()
  }, [loadRenders])

  if (loading) {
    return (
      <p className="text-xs text-[#888] flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading your library…
      </p>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-center">
        <p className="text-xs text-red-700 mb-2">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadRenders()}
          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#444] border border-[#EDEAE2]"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    )
  }

  if (!renders.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#CCC] bg-[#FAFAF8] p-4 text-center">
        <ImageIcon className="mx-auto mb-2 h-8 w-8 text-[#E0DDD5]" />
        <p className="text-xs font-semibold text-[#666] mb-1">No reusable backgrounds yet</p>
        <p className="text-[11px] text-[#888] leading-snug">
          Images from job photos, stock, or AI Generate (Step 2) appear here after you create a
          post. Week Ahead AI-only renders may not appear until their background URL is saved.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#888]">
        Pick a saved background - uses the original photo, not the finished post with text.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
        {renders.map((render) => {
          const photoUrl = reusablePhotoUrl(render)
          if (!photoUrl) return null

          const formatKey = formatPresetKey(render.preset)
          const accent = formatKey ? FORMAT_ACCENTS[formatKey] : null
          const FormatIcon = accent?.Icon
          const selected = selectedUrl === photoUrl

          return (
            <div key={render.id} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onSelect(photoUrl, render.id)}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selected
                    ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                    : 'border-[#EDEAE2] hover:border-[#CCC]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                <ImageExpandTrigger src={photoUrl} alt="Library background" />
              </button>
              <div className="flex flex-wrap items-center gap-1 px-0.5">
                {accent && FormatIcon ? (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black ${accent.badgeBg} ${accent.badgeIcon}`}
                  >
                    <FormatIcon className="h-2.5 w-2.5" />
                    {formatPresetLabel(render.preset)}
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FFFBEA] px-1.5 py-0.5 text-[9px] font-black text-[#886600]">
                    {formatPresetLabel(render.preset)}
                  </span>
                )}
                <span className="text-[9px] text-[#999]">{platformSizeLabel(render.platform)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

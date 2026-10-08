'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import {
  AI_SLIDES_MAX,
  AI_SLIDES_MIN,
  SLIDE_TOPIC_MAX,
  type SlideDeckResult,
} from '@/lib/social/tiktokSlides/slideTypes'

type Props = {
  jobId: string | null
  /** Current photo, offered as the background behind every slide. */
  photoUrl: string | null
  onDone: (deck: SlideDeckResult) => void
  onCancel: () => void
}

const COUNTS = Array.from({ length: AI_SLIDES_MAX - AI_SLIDES_MIN + 1 }, (_, i) => AI_SLIDES_MIN + i)

export function ComposerSlideGenerator({ jobId, photoUrl, onDone, onCancel }: Props) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [usePhoto, setUsePhoto] = useState(Boolean(photoUrl))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/social/tiktok-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slideCount: count, jobId, backgroundUrl: usePhoto ? photoUrl : null }),
      })
      const json = (await res.json().catch(() => ({}))) as Partial<SlideDeckResult> & { error?: string }
      if (!res.ok) throw new Error(json.error || `Could not make slides (${res.status})`)
      if (!json.slides?.length || !json.coverUrl) throw new Error('No slides came back - try again.')
      onDone({ slides: json.slides, coverUrl: json.coverUrl, caption: json.caption ?? '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not make slides')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-[#F5C518] bg-[#FFF8DB] p-3" data-testid="composer-slide-generator">
      <label className="block text-sm font-bold text-[#18181B]">
        What should the slides be about?
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, SLIDE_TOPIC_MAX))}
          rows={2}
          placeholder="e.g. 5 signs your switchboard needs upgrading"
          className="mt-1 block w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-normal"
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
          Slides
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-lg border border-[#E4E4E7] bg-white px-2 py-1 text-sm font-normal"
          >
            {COUNTS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        {photoUrl && (
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={usePhoto} onChange={(e) => setUsePhoto(e.target.checked)} />
            Use my photo as the background
          </label>
        )}
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void generate()}
          disabled={busy || topic.trim().length < 3}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? 'Making slides…' : 'Make slides'}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="text-xs font-semibold text-zinc-600 hover:underline">
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-zinc-600">Free - no render credits. Replaces your current image and slides.</p>
    </div>
  )
}

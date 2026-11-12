'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MusicTrackRow } from '@/components/social/music/MusicTrackRow'
import { useMusicPreview } from '@/components/social/music/useMusicPreview'
import { MUSIC_TRACKS, searchMusic } from '@/lib/social/music/musicCatalog'
import { MUSIC_CATEGORIES, MUSIC_CATEGORY_LABELS, type MusicCategory, type MusicTrack } from '@/lib/social/music/musicTypes'

type Props = {
  selectedId: string | null
  onUse: (track: MusicTrack) => void
}

const PAGE = 30

const chip = (on: boolean) =>
  `shrink-0 rounded-full px-3 py-1 text-xs font-bold ${on ? 'bg-[#18181B] text-white' : 'border border-[#E4E4E7] bg-white text-zinc-700'}`

/** Browse the music library by mood or search, tap play to hear a song, then Use. */
export function MusicPicker({ selectedId, onUse }: Props) {
  const [category, setCategoryState] = useState<MusicCategory | 'all'>('all')
  const [query, setQueryState] = useState('')
  const [shown, setShown] = useState(PAGE)
  const preview = useMusicPreview()
  const results = useMemo(() => searchMusic({ category, query }), [category, query])
  const setCategory = (next: MusicCategory | 'all') => {
    setCategoryState(next)
    setShown(PAGE)
  }
  const setQuery = (next: string) => {
    setQueryState(next)
    setShown(PAGE)
  }

  const counts = useMemo(() => {
    const map = new Map<MusicCategory, number>()
    for (const t of MUSIC_TRACKS) map.set(t.category, (map.get(t.category) ?? 0) + 1)
    return map
  }, [])

  return (
    <div className="space-y-2" data-testid="music-picker">
      <label className="flex items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or moods (e.g. happy, piano, summer)"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button type="button" className={chip(category === 'all')} onClick={() => setCategory('all')}>
          All
        </button>
        {MUSIC_CATEGORIES.filter((c) => counts.get(c)).map((c) => (
          <button key={c} type="button" className={chip(category === c)} onClick={() => setCategory(c)}>
            {MUSIC_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      {preview.error && <p className="text-xs font-semibold text-red-600">{preview.error}</p>}
      {results.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500">No songs match - try another word or mood.</p>
      ) : (
        <ul className="max-h-80 space-y-0.5 overflow-y-auto rounded-xl border border-[#E4E4E7] bg-white p-1">
          {results.slice(0, shown).map((track) => (
            <MusicTrackRow
              key={track.id}
              track={track}
              playing={preview.playingId === track.id}
              loading={preview.loadingId === track.id}
              selected={selectedId === track.id}
              onToggle={() => void preview.toggle(track)}
              onUse={() => {
                preview.stop()
                onUse(track)
              }}
            />
          ))}
          {results.length > shown && (
            <li>
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="w-full py-2 text-xs font-bold text-zinc-600 hover:underline"
              >
                Show more ({results.length - shown} left)
              </button>
            </li>
          )}
        </ul>
      )}
      <p className="text-[11px] text-zinc-500">All songs are free to use on any platform - no credit needed.</p>
    </div>
  )
}

'use client'

import { ChevronLeft, Clapperboard, Loader2 } from 'lucide-react'
import {
  SLIDESHOW_SECONDS_OPTIONS,
  SLIDESHOW_TRANSITIONS,
  type SlideshowSlide,
  type SlideshowTransition,
} from '@/lib/social/slideshow/slideshowTypes'
import { SlideshowSlideCard } from '@/components/social/slideshow/SlideshowSlideCard'
import { SlideshowAccentPicker } from '@/components/social/slideshow/SlideshowAccentPicker'

type Props = {
  slides: SlideshowSlide[]
  businessName: string
  brandColor: string | null
  accentColor: string | null
  onAccentColor: (color: string | null) => void
  showText: boolean
  onShowText: (show: boolean) => void
  creating: boolean
  error: string | null
  secondsPerSlide: number
  transition: SlideshowTransition
  onSeconds: (seconds: number) => void
  onTransition: (transition: SlideshowTransition) => void
  onChange: (index: number, patch: Partial<Pick<SlideshowSlide, 'heading' | 'body'>>) => void
  onBack: () => void
  onCreate: () => void
}

const TRANSITION_LABELS: Record<SlideshowTransition, string> = { fade: 'Fade', slide: 'Slide across', none: 'Straight cut' }
const select = 'rounded-lg border border-[#E4E4E7] bg-white px-2 py-1 text-sm font-normal disabled:opacity-60'

export function SlideshowEditor(props: Props) {
  const { slides, creating, secondsPerSlide, transition, showText } = props
  const total = slides.length * secondsPerSlide
  const missingHeading = showText && slides.some((s) => !s.heading.trim())

  return (
    <div className="space-y-4" data-testid="slideshow-editor">
      <p className="text-sm text-zinc-600">
        {showText
          ? 'Check the wording on each slide. Edit anything you like, then create your slides.'
          : 'Your photos will be used as they are, with no text or business name.'}
      </p>
      <label className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
        <input
          type="checkbox"
          checked={showText}
          disabled={creating}
          onChange={(e) => props.onShowText(e.target.checked)}
          className="h-4 w-4 accent-[#18181B]"
          data-testid="slideshow-show-text"
        />
        Text on slides
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slides.map((slide, i) => (
          <SlideshowSlideCard
            key={`${slide.imageUrl}-${i}`}
            slide={slide}
            index={i}
            total={slides.length}
            businessName={props.businessName}
            brandColor={props.accentColor ?? props.brandColor}
            showText={showText}
            disabled={creating}
            onChange={(patch) => props.onChange(i, patch)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
          Seconds per slide
          <select value={secondsPerSlide} disabled={creating} onChange={(e) => props.onSeconds(Number(e.target.value))} className={select}>
            {SLIDESHOW_SECONDS_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
          Transition
          <select
            value={transition}
            disabled={creating}
            onChange={(e) => props.onTransition(SLIDESHOW_TRANSITIONS.find((t) => t === e.target.value) ?? 'fade')}
            className={select}
          >
            {SLIDESHOW_TRANSITIONS.map((t) => (
              <option key={t} value={t}>{TRANSITION_LABELS[t]}</option>
            ))}
          </select>
        </label>
        <span className="text-xs text-zinc-500">{total}s video, 9:16</span>
      </div>
      {showText && (
        <SlideshowAccentPicker
          brandColor={props.brandColor}
          value={props.accentColor}
          disabled={creating}
          onChange={props.onAccentColor}
        />
      )}

      {props.error && <p className="text-xs font-semibold text-red-600">{props.error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={props.onCreate}
          disabled={creating || missingHeading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#18181B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          data-testid="slideshow-create"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clapperboard className="h-4 w-4" />}
          {creating ? 'Creating your slides…' : 'Create slides'}
        </button>
        <button type="button" onClick={props.onBack} disabled={creating} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:underline disabled:opacity-50">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to images
        </button>
      </div>
      {creating && <p className="text-xs text-zinc-500">Making the video. This usually takes under a minute.</p>}
    </div>
  )
}

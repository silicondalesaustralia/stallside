'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SLIDESHOW_DEFAULT_SECONDS,
  type SlideshowJobView,
  type SlideshowRenderResult,
  type SlideshowSlide,
  type SlideshowTransition,
} from '@/lib/social/slideshow/slideshowTypes'
import type { SlideshowDraft } from '@/lib/social/slideshow/slideshowDraft'
import { getSlideshowJob, renderSlideshow, writeSlideshowSlides } from '@/components/social/slideshow/slideshowApi'

export type SlideshowPhase = 'pick' | 'writing' | 'edit' | 'creating' | 'done'
export type SlideshowVideo = NonNullable<SlideshowJobView['video']>

const POLL_MS = 3000
const POLL_LIMIT = 100

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useSlideshowBuild(params: {
  jobId: string | null
  initial?: SlideshowDraft | null
  onVideo: (video: SlideshowVideo, rendered: SlideshowRenderResult) => void
}) {
  const { jobId, initial, onVideo } = params
  const [phase, setPhase] = useState<SlideshowPhase>(initial?.stage === 'edit' ? 'edit' : 'pick')
  const [slides, setSlides] = useState<SlideshowSlide[]>(initial?.slides ?? [])
  const [caption, setCaption] = useState(initial?.caption ?? '')
  const [secondsPerSlide, setSecondsPerSlide] = useState<number>(initial?.secondsPerSlide ?? SLIDESHOW_DEFAULT_SECONDS)
  const [transition, setTransition] = useState<SlideshowTransition>(initial?.transition ?? 'fade')
  const [rendered, setRendered] = useState<SlideshowRenderResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const write = useCallback(
    async (images: string[], context: string) => {
      setPhase('writing')
      setError(null)
      try {
        const result = await writeSlideshowSlides({ images, context, jobId })
        if (!alive.current) return
        setSlides(result.slides)
        setCaption(result.caption)
        setPhase('edit')
      } catch (err) {
        if (!alive.current) return
        setError(err instanceof Error ? err.message : 'Could not write the slides')
        setPhase('pick')
      }
    },
    [jobId],
  )

  const updateSlide = useCallback((index: number, patch: Partial<Pick<SlideshowSlide, 'heading' | 'body'>>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }, [])

  const pollVideo = useCallback(async (renderJobId: string): Promise<SlideshowVideo> => {
    for (let i = 0; i < POLL_LIMIT; i += 1) {
      await wait(POLL_MS)
      if (!alive.current) throw new Error('cancelled')
      const job = await getSlideshowJob(renderJobId)
      if (job.status === 'failed') throw new Error(job.error || 'The video could not be made.')
      if (job.status === 'completed') {
        if (!job.video) throw new Error('The video finished but could not be found in your Library.')
        return job.video
      }
    }
    throw new Error('The video is taking longer than usual. It will appear in your Library when it is ready.')
  }, [])

  const create = useCallback(async () => {
    setPhase('creating')
    setError(null)
    try {
      const about = [caption, ...slides.map((s) => `${s.heading}. ${s.body}`)].join(' ').trim()
      const result = await renderSlideshow({ slides, jobId, secondsPerSlide, transition, about })
      if (!alive.current) return
      setRendered(result)
      const video = await pollVideo(result.renderJobId)
      if (!alive.current) return
      setPhase('done')
      onVideo(video, result)
    } catch (err) {
      if (!alive.current) return
      setError(err instanceof Error ? err.message : 'Could not create the slides')
      setPhase('edit')
    }
  }, [caption, slides, jobId, secondsPerSlide, transition, pollVideo, onVideo])

  const reset = useCallback(() => {
    setPhase('pick')
    setSlides([])
    setRendered(null)
    setError(null)
  }, [])

  return {
    phase, setPhase, slides, caption, secondsPerSlide, setSecondsPerSlide, transition, setTransition,
    rendered, error, write, updateSlide, create, reset,
  }
}

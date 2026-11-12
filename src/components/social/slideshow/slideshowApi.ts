import type { SlideDeckResult } from '@/lib/social/tiktokSlides/slideTypes'
import {
  SLIDESHOW_DEFAULT_SECONDS,
  type SlideshowJobView,
  type SlideshowRenderRequest,
  type SlideshowRenderResult,
  type SlideshowWriteRequest,
  type SlideshowWriteResult,
} from '@/lib/social/slideshow/slideshowTypes'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string; errors?: string[] }
    throw new Error(json.error || json.errors?.[0] || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

function postJson<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

export function writeSlideshowSlides(body: SlideshowWriteRequest): Promise<SlideshowWriteResult> {
  return postJson('/api/social/slideshow/write', body)
}

export function renderSlideshow(body: SlideshowRenderRequest): Promise<SlideshowRenderResult> {
  return postJson('/api/social/slideshow/render', body)
}

export function getSlideshowJob(id: string): Promise<SlideshowJobView> {
  return request(`/api/social/slideshow/jobs/${encodeURIComponent(id)}`, { cache: 'no-store' })
}

/** One AI-written slide per photo, rendered as images only (TikTok photo slides, no video). */
export async function makePhotoSlides(images: string[], context: string, jobId: string | null): Promise<SlideDeckResult> {
  const written = await writeSlideshowSlides({ images, context, jobId })
  const rendered = await renderSlideshow({
    slides: written.slides,
    jobId,
    secondsPerSlide: SLIDESHOW_DEFAULT_SECONDS,
    transition: 'fade',
    about: '',
    makeVideo: false,
  })
  return { slides: rendered.slideUrls, coverUrl: rendered.coverUrl, caption: written.caption }
}

/** /api/social/upload-media takes at most 10 files per request. */
export async function uploadSlideshowImages(files: File[]): Promise<{ urls: string[]; error: string | null }> {
  const form = new FormData()
  for (const file of files.slice(0, 10)) form.append('file', file)
  const json = await request<{ media?: { url: string }[]; errors?: string[] }>('/api/social/upload-media', {
    method: 'POST',
    body: form,
  })
  return { urls: (json.media ?? []).map((m) => m.url), error: json.errors?.[0] ?? null }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import type { SlideshowSlide } from '@/lib/social/slideshow/slideshowTypes'

export const SLIDESHOW_LIBRARY_PRESET = 'slideshow'

/**
 * Each rendered slide becomes a Library photo. result_url is the finished slide;
 * photo_url keeps the original photo so "Add from Library" reuses it without baked text.
 * Never throws: the slideshow still succeeds if Library saving fails.
 */
export async function saveSlidesToLibrary(
  db: SupabaseClient,
  input: { businessId: string; jobId: string | null; slides: SlideshowSlide[]; slideUrls: string[] },
): Promise<void> {
  const rows = input.slides.map((slide, index) => ({
    business_id: input.businessId,
    job_id: input.jobId,
    preset: SLIDESHOW_LIBRARY_PRESET,
    platform: 'instagram',
    photo_source: 'slideshow',
    photo_url: slide.imageUrl,
    content: { heading: slide.heading, body: slide.body, slideIndex: index, slideCount: input.slides.length },
    result_url: input.slideUrls[index],
    status: 'completed',
  }))
  const { error } = await db.from('hybrid_social_renders').insert(rows)
  if (error) console.warn('[Slideshow] saving slides to Library failed', { businessId: input.businessId, error: error.message })
}

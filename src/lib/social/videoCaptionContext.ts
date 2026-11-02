import type {
  DesignedCaptionBusiness,
  DesignedCaptionJob,
} from '@/lib/social/designedCaptionContext'
import { VENDL_SOCIAL_AUDIENCE } from '@/lib/socialHost/socialAudience'
import { SCRIPT_PROMPT_MAX_CHARS } from '@/lib/social/videoClips/clipScript'
import { VIDEO_POST_TITLE_MAX } from '@/lib/social/videoCaptionTitle'

export type VideoCaptionContext = {
  aboutText: string | null
  /** Auto-transcribed speech from the video (clips made in Videos). */
  script?: string | null
  /** Text layers the seller added in the editor, cut sections removed. */
  overlayTexts?: string[]
  /** Name the seller gave the uploaded video (editable on the Videos page). */
  sourceTitle?: string | null
  /** The clip's current title (AI-picked at render, or a previous generated title). */
  clipTitle?: string | null
  business: DesignedCaptionBusiness
  job: DesignedCaptionJob | null
  businessId?: string | null
}

export const VIDEO_CAPTION_USES_RENDER_CREDITS = false

const VIDEO_ANALYSIS_CLAIMS =
  /\b(as you can see in the video|in this video you can see|watch as we|shown in the video|visible in the video)\b/i

export function buildVideoCaptionPrompt(params: VideoCaptionContext): {
  system: string
  user: string
} {
  const { aboutText, business, job } = params
  const jobSuburb = job?.suburb?.trim() || null
  const jobState = job?.state?.trim() || null
  const bizSuburb = business.suburb?.trim() || null
  const script = params.script?.trim().slice(0, SCRIPT_PROMPT_MAX_CHARS) || null
  const overlays = (params.overlayTexts ?? []).map((t) => t.trim()).filter(Boolean)
  const sourceTitle = params.sourceTitle?.trim() || null
  const clipTitle = params.clipTitle?.trim() || null

  const system = [
    `You write ready-to-post social captions for ${VENDL_SOCIAL_AUDIENCE}`,
    'Return JSON only, shaped {"caption": string, "title": string}.',
    'caption: ONE ready-to-post caption. Do not number options. Do not use markdown headings.',
    `title: a short, specific post title under ${VIDEO_POST_TITLE_MAX} characters for YouTube or a video library. No hashtags, no emojis, no quotes, no clickbait.`,
    'On-screen text, when supplied, is the seller\'s own wording added to the video, usually their offer or call to action. Repeat its offer or call to action in the caption and never contradict it.',
    'You have NOT watched or analysed the video. Write from the supplied text context only.',
    'Never claim to have seen the video or describe specific on-screen actions unless the user wrote them in their description.',
    'Do not use phrases like "as you can see in the video" or "watch as we".',
    'When a video script (transcript of what is said) is supplied, base the caption on what is said in it: its main point, offer or tips. You may paraphrase or briefly quote it. It is auto-transcribed, so fix obvious mis-heard words and never copy it verbatim as the caption.',
    'Do not invent reviews, ratings, awards, years in business, certifications, discounts, prices, collection dates, ingredients, phone numbers, websites, or customer testimonials unless they appear in the trusted context below.',
    'Short natural paragraphs. Useful hook. Customer-focused. One clear CTA. 3 to 6 relevant hashtags. About 60-140 words.',
    'Avoid generic AI filler such as "top-notch", "another great job", or "we\'re thrilled" unless the context genuinely supports it.',
    'Use specific product wording from the product or business context when available.',
  ].join(' ')

  const lines: string[] = []
  lines.push('Write a social caption for an uploaded video library post.')
  lines.push('Use this priority order (highest first):')
  lines.push('1. User video description (about text)')
  lines.push('2. On-screen text (the seller\'s own offer / call to action)')
  lines.push('3. Video script (what is said in the video)')
  lines.push('4. Video name')
  lines.push('5. Related product / offer context')
  lines.push('6. Trusted business context')
  lines.push('7. Generic fallback only if none of the above exist')
  lines.push('')
  lines.push('USER VIDEO DESCRIPTION:')
  lines.push(aboutText?.trim() || '(none - infer carefully from the script/product/business only)')
  lines.push('')
  lines.push('ON-SCREEN TEXT (added by the seller, in order):')
  lines.push(overlays.length ? overlays.map((t) => `- ${t}`).join('\n') : '(none)')
  lines.push('')
  lines.push('VIDEO NAME:')
  if (sourceTitle) lines.push(`- Name the seller gave the video: ${sourceTitle}`)
  if (clipTitle && clipTitle.toLowerCase() !== sourceTitle?.toLowerCase()) lines.push(`- Clip title: ${clipTitle}`)
  if (!sourceTitle && !clipTitle) lines.push('(none)')
  else if (sourceTitle && clipTitle) lines.push('- If these disagree, follow the seller\'s video name.')
  lines.push('')
  lines.push('VIDEO SCRIPT (auto-transcribed speech):')
  lines.push(script || '(none)')
  lines.push('')
  lines.push('RELATED PRODUCT / OFFER CONTEXT:')
  if (job && (job.title?.trim() || job.description?.trim() || jobSuburb)) {
    if (job.title?.trim()) lines.push(`- Product or offer: ${job.title.trim()}`)
    if (jobSuburb) {
      lines.push(`- Suburb: ${jobSuburb}${jobState ? `, ${jobState}` : ''}`)
    } else {
      lines.push('- Suburb: (unknown - do not invent a suburb)')
    }
    if (job.description?.trim()) {
      lines.push(`- Details (prices, dates, contents): ${job.description.trim()}`)
    }
  } else {
    lines.push('(none)')
  }
  lines.push('')
  lines.push('BUSINESS CONTEXT:')
  lines.push(`- Business name: ${business.name}`)
  if (business.services?.trim()) lines.push(`- What they sell: ${business.services.trim()}`)
  if (bizSuburb) lines.push(`- Location: ${bizSuburb}`)
  if (business.brandVoice?.trim()) lines.push(`- Brand voice: ${business.brandVoice.trim()}`)
  if (business.cta?.trim()) lines.push(`- Default CTA: ${business.cta.trim()}`)
  if (business.phone?.trim()) lines.push(`- Phone (use only if appropriate for CTA): ${business.phone.trim()}`)
  if (business.website?.trim()) {
    lines.push(`- Website (use only if appropriate for CTA): ${business.website.trim()}`)
  }
  lines.push('')
  lines.push('IMPORTANT:')
  lines.push('You have not seen the video. Do not describe visuals; you only know what is said in the script and the on-screen text.')
  lines.push('If the user description conflicts with product context, follow the user description.')

  return { system, user: lines.join('\n') }
}

export function mockVideoCaption(params: VideoCaptionContext): string {
  const subject =
    params.aboutText?.trim() ||
    params.job?.title?.trim() ||
    params.business.services?.trim() ||
    'fresh from the stall'
  const suburb = params.job?.suburb?.trim()
  const lead = suburb ? `${subject} in ${suburb}.` : `${subject}.`
  const mid =
    params.aboutText?.trim() ||
    'Made locally, with care, in small batches.'
  const cta = params.business.cta?.trim() || `Order from ${params.business.name}.`
  return `${lead}\n\n${mid}\n\n${cta}\n\n#ShopLocal #SupportLocal #FreshLocal`
}

export function captionContainsVideoAnalysisClaims(text: string): boolean {
  return VIDEO_ANALYSIS_CLAIMS.test(text)
}

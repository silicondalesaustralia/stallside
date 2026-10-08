import type {
  DesignedCaptionBusiness,
  DesignedCaptionJob,
} from '@/lib/social/designedCaptionContext'

export type VideoCaptionContext = {
  aboutText: string | null
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

  const system = [
    'You write ready-to-post social captions for Australian trade businesses.',
    'Return ONE caption only. Do not number options. Do not use markdown headings.',
    'You have NOT watched or analysed the video. Write from the supplied text context only.',
    'Never claim to have seen the video or describe specific on-screen actions unless the user wrote them in their description.',
    'Do not use phrases like "as you can see in the video" or "watch as we".',
    'Do not invent reviews, ratings, awards, years in business, licences, rebate figures, prices, savings, warranties, equipment brands/models, phone numbers, websites, or customer testimonials unless they appear in the trusted context below.',
    'Short natural paragraphs. Useful hook. Customer-focused. One clear CTA. 3 to 6 relevant hashtags. About 60-140 words.',
    'Avoid generic AI filler such as "top-notch", "another great job", or "we\'re thrilled" unless the context genuinely supports it.',
    'Use trade-specific wording from the job or business context when available.',
  ].join(' ')

  const lines: string[] = []
  lines.push('Write a social caption for an uploaded video library post.')
  lines.push('Use this priority order (highest first):')
  lines.push('1. User video description (about text)')
  lines.push('2. Related job context')
  lines.push('3. Trusted business context')
  lines.push('4. Generic fallback only if none of the above exist')
  lines.push('')
  lines.push('USER VIDEO DESCRIPTION:')
  lines.push(aboutText?.trim() || '(none - infer carefully from job/business only)')
  lines.push('')
  lines.push('RELATED JOB CONTEXT:')
  if (job && (job.title?.trim() || job.description?.trim() || jobSuburb)) {
    if (job.title?.trim()) lines.push(`- Job type / title: ${job.title.trim()}`)
    if (jobSuburb) {
      lines.push(`- Suburb: ${jobSuburb}${jobState ? `, ${jobState}` : ''}`)
    } else {
      lines.push('- Suburb: (unknown - do not invent a suburb)')
    }
    if (job.description?.trim()) {
      lines.push(`- Work notes: ${job.description.trim()}`)
    }
  } else {
    lines.push('(none)')
  }
  lines.push('')
  lines.push('BUSINESS CONTEXT:')
  lines.push(`- Business name: ${business.name}`)
  if (business.services?.trim()) lines.push(`- Services: ${business.services.trim()}`)
  if (bizSuburb) lines.push(`- Location: ${bizSuburb}`)
  if (business.brandVoice?.trim()) lines.push(`- Brand voice: ${business.brandVoice.trim()}`)
  if (business.cta?.trim()) lines.push(`- Default CTA: ${business.cta.trim()}`)
  if (business.phone?.trim()) lines.push(`- Phone (use only if appropriate for CTA): ${business.phone.trim()}`)
  if (business.website?.trim()) {
    lines.push(`- Website (use only if appropriate for CTA): ${business.website.trim()}`)
  }
  lines.push('')
  lines.push('IMPORTANT:')
  lines.push('You have not seen the video. Do not describe visuals.')
  lines.push('If the user description conflicts with job context, follow the user description.')

  return { system, user: lines.join('\n') }
}

export function mockVideoCaption(params: VideoCaptionContext): string {
  const subject =
    params.aboutText?.trim() ||
    params.job?.title?.trim() ||
    params.business.services?.trim() ||
    'recent work'
  const suburb = params.job?.suburb?.trim()
  const lead = suburb ? `${subject} in ${suburb}.` : `${subject}.`
  const mid =
    params.aboutText?.trim() ||
    'Professional work carried out with care and attention to detail.'
  const cta = params.business.cta?.trim() || `Contact ${params.business.name} to learn more.`
  return `${lead}\n\n${mid}\n\n${cta}\n\n#LocalTradie #TradeLife #QualityWork`
}

export function captionContainsVideoAnalysisClaims(text: string): boolean {
  return VIDEO_ANALYSIS_CLAIMS.test(text)
}

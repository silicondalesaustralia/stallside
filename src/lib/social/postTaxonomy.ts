/**
 * Social compose occasion taxonomy - 12 categories × 42 sub-types.
 * Single source of truth for Step 1 picker, compose soft defaults, and AI hints.
 *
 * Note: `before_after_job` is a finished-job photo post - not the paid
 * Before & After Render product (`before_after_comparison` infographic preset).
 */

import type { AiImagePurpose } from '@/lib/social/aiImageStyles'

// ── Categories (12) ───────────────────────────────────────────────────────────

export const POST_CATEGORIES = [
  { id: 'show_our_work',      label: 'Show Our Work' },
  { id: 'promote_service',    label: 'Promote a Service' },
  { id: 'educate_customers',  label: 'Educate Customers' },
  { id: 'problem_solution',   label: 'Problem & Solution' },
  { id: 'promotions',         label: 'Promotions' },
  { id: 'customer_success',   label: 'Customer Success' },
  { id: 'products_equipment', label: 'Products & Equipment' },
  { id: 'meet_business',      label: 'Meet the Business' },
  { id: 'local_community',    label: 'Local Community' },
  { id: 'seasonal_timely',    label: 'Seasonal & Timely' },
  { id: 'trust_expertise',    label: 'Trust & Expertise' },
  { id: 'rebates_savings',    label: 'Rebates & Savings' },
] as const

export type PostCategoryId = (typeof POST_CATEGORIES)[number]['id']

export const DEFAULT_POST_CATEGORY_ID: PostCategoryId = 'show_our_work'

export const POST_CATEGORY_LABELS: Record<PostCategoryId, string> = Object.fromEntries(
  POST_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<PostCategoryId, string>

// ── Sub-types (42, globally unique ids) ───────────────────────────────────────

export const POST_SUBTYPE_DEFINITIONS = [
  // Show Our Work (4)
  {
    id: 'completed_job',
    categoryId: 'show_our_work',
    label: 'Completed Job',
    captionBrief: 'Celebrate a completed job - quality workmanship, proud but grounded.',
    infographicHint: 'Focus on the finished result and customer benefit.',
    descriptionFallback: null,
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },
  {
    id: 'before_after_job',
    categoryId: 'show_our_work',
    label: 'Before/After',
    captionBrief: 'Show a visible before-and-after transformation on site - outcomes, not hype.',
    infographicHint: 'Emphasise contrast between before and after states.',
    descriptionFallback: 'Before and after photos from a recent job',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'before_after_comparison' },
  },
  {
    id: 'work_in_progress',
    categoryId: 'show_our_work',
    label: 'WIP',
    captionBrief: 'Work in progress on site - professional, safe, and on the way to done.',
    infographicHint: 'Highlight active work and craftsmanship mid-job.',
    descriptionFallback: 'Work in progress on a current job',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },
  {
    id: 'big_project',
    categoryId: 'show_our_work',
    label: 'Big Project',
    captionBrief: 'A larger or high-impact project - scale, complexity, and a strong result.',
    infographicHint: 'Stress scope and pride in delivering a major job.',
    descriptionFallback: 'Large project recently completed',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },

  // Promote a Service (4)
  {
    id: 'service_spotlight',
    categoryId: 'promote_service',
    label: 'Service Spotlight',
    captionBrief: 'Spotlight one core service - what it is, who it helps, why call you.',
    infographicHint: 'Explain one service clearly with customer benefits.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },
  {
    id: 'emergency_service',
    categoryId: 'promote_service',
    label: 'Emergency',
    captionBrief: 'Emergency or urgent call-out service - responsive, reliable, local.',
    infographicHint: 'Urgency without fear-mongering; emphasise fast response.',
    descriptionFallback: 'Emergency call-out service available',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },
  {
    id: 'installation',
    categoryId: 'promote_service',
    label: 'Installation',
    captionBrief: 'Professional installation work - neat, compliant, built to last.',
    infographicHint: 'Installation benefits and what the customer gets.',
    descriptionFallback: 'Professional installation service',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'process_steps' },
  },
  {
    id: 'repair',
    categoryId: 'promote_service',
    label: 'Repair',
    captionBrief: 'Repair and fix-it work - diagnose, solve, leave it working properly.',
    infographicHint: 'Common repair scenarios and reliable fixes.',
    descriptionFallback: 'Repair and maintenance service',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },

  // Educate Customers (4)
  {
    id: 'tips',
    categoryId: 'educate_customers',
    label: 'Tips',
    captionBrief: 'Practical tips homeowners can use - helpful expert advice.',
    infographicHint: 'Short actionable tips list for the trade.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'faq',
    categoryId: 'educate_customers',
    label: 'FAQ',
    captionBrief: 'Answer common customer questions clearly and confidently.',
    infographicHint: 'FAQ-style educational content.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'how_it_works',
    categoryId: 'educate_customers',
    label: 'How It Works',
    captionBrief: 'Explain how your service or process works - simple steps, no jargon.',
    infographicHint: 'Step-by-step how the service works.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'process_steps' },
  },
  {
    id: 'myths',
    categoryId: 'educate_customers',
    label: 'Myths',
    captionBrief: 'Bust a common myth in your trade - educate and build trust.',
    infographicHint: 'Myth vs fact educational angle.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },

  // Problem & Solution (3)
  {
    id: 'diagnosis',
    categoryId: 'problem_solution',
    label: 'Diagnosis',
    captionBrief: 'How you diagnose a common problem - expert eyes, clear explanation.',
    infographicHint: 'Problem diagnosis and professional assessment.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'process_steps' },
  },
  {
    id: 'warning_signs',
    categoryId: 'problem_solution',
    label: 'Warning Signs',
    captionBrief: 'Warning signs customers should not ignore - helpful, not alarmist.',
    infographicHint: 'List warning signs and when to call a pro.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'common_problems',
    categoryId: 'problem_solution',
    label: 'Common Problems',
    captionBrief: 'Common problems you fix - relatable scenarios, your solution.',
    infographicHint: 'Common issues and how the business solves them.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },

  // Promotions (4)
  {
    id: 'offer',
    categoryId: 'promotions',
    label: 'Offer',
    captionBrief: 'A current offer or deal - clear value, honest urgency.',
    infographicHint: 'Promotional offer with CTA.',
    descriptionFallback: 'Special offer - get in touch today',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'discount',
    categoryId: 'promotions',
    label: 'Discount',
    captionBrief: 'Discount or limited-time pricing - straightforward, not spammy.',
    infographicHint: 'Discount promotion details.',
    descriptionFallback: 'Limited-time discount available',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'availability',
    categoryId: 'promotions',
    label: 'Availability',
    captionBrief: 'Open slots or availability - book before the schedule fills.',
    infographicHint: 'Availability / booking window promotion.',
    descriptionFallback: 'Limited availability - book your job today',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'seasonal_campaign',
    categoryId: 'promotions',
    label: 'Seasonal Campaign',
    captionBrief: 'Seasonal campaign or themed promo tied to time of year.',
    infographicHint: 'Seasonal promotional campaign.',
    descriptionFallback: 'Seasonal special - contact us to book',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },

  // Customer Success (3)
  {
    id: 'review',
    categoryId: 'customer_success',
    label: 'Review',
    captionBrief: 'Share a 5-star review win - grateful, authentic, local pride.',
    infographicHint: 'Customer review highlight.',
    descriptionFallback: 'Another 5-star review from a happy customer',
    suggestJobPicker: true,
    aiPurpose: 'review' as AiImagePurpose,
    composeDefaults: { format: 'quote_card', photoSource: 'job', infographicPreset: 'did_you_know' },
  },
  {
    id: 'testimonial',
    categoryId: 'customer_success',
    label: 'Testimonial',
    captionBrief: 'Customer testimonial - their words, your quality work.',
    infographicHint: 'Testimonial-style social proof.',
    descriptionFallback: 'Customer testimonial about our work',
    suggestJobPicker: true,
    aiPurpose: 'review' as AiImagePurpose,
    composeDefaults: { format: 'quote_card', photoSource: 'job', infographicPreset: 'did_you_know' },
  },
  {
    id: 'customer_story',
    categoryId: 'customer_success',
    label: 'Customer Story',
    captionBrief: 'Short customer story - problem, your work, happy outcome.',
    infographicHint: 'Narrative customer success story.',
    descriptionFallback: 'How we helped a local customer',
    suggestJobPicker: true,
    aiPurpose: 'review' as AiImagePurpose,
    composeDefaults: { format: 'quote_card', photoSource: 'job', infographicPreset: 'process_steps' },
  },

  // Products & Equipment (3)
  {
    id: 'product_spotlight',
    categoryId: 'products_equipment',
    label: 'Product Spotlight',
    captionBrief: 'Spotlight a product or brand you install - quality you stand behind.',
    infographicHint: 'Product spotlight for trades installs.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },
  {
    id: 'recommendation',
    categoryId: 'products_equipment',
    label: 'Recommendation',
    captionBrief: 'Recommend equipment or products you trust for customer jobs.',
    infographicHint: 'Expert product recommendation.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'new_equipment',
    categoryId: 'products_equipment',
    label: 'New Equipment',
    captionBrief: 'New tools or equipment that helps you deliver better work.',
    infographicHint: 'New equipment capability for the business.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },

  // Meet the Business (3)
  {
    id: 'team',
    categoryId: 'meet_business',
    label: 'Team',
    captionBrief: 'Introduce the team - real people, skilled and approachable.',
    infographicHint: 'Team introduction post.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'process_steps' },
  },
  {
    id: 'behind_scenes',
    categoryId: 'meet_business',
    label: 'Behind the Scenes',
    captionBrief: 'Behind the scenes - how you work, prep, and care on every job.',
    infographicHint: 'Behind-the-scenes business culture.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'process_steps' },
  },
  {
    id: 'milestones',
    categoryId: 'meet_business',
    label: 'Milestones',
    captionBrief: 'Business milestone - years in trade, jobs completed, community thanks.',
    infographicHint: 'Business milestone celebration.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'none', infographicPreset: 'did_you_know' },
  },

  // Local Community (3)
  {
    id: 'suburb_post',
    categoryId: 'local_community',
    label: 'Suburb Post',
    captionBrief: 'Local suburb focus - proud to serve this area and neighbours.',
    infographicHint: 'Local suburb / service area post.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'checklist' },
  },
  {
    id: 'sponsorship',
    categoryId: 'local_community',
    label: 'Sponsorship',
    captionBrief: 'Community sponsorship or support - giving back locally.',
    infographicHint: 'Community sponsorship announcement.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },
  {
    id: 'local_event',
    categoryId: 'local_community',
    label: 'Local Event',
    captionBrief: 'Local event presence or community activity.',
    infographicHint: 'Local event participation.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },

  // Seasonal & Timely (4)
  {
    id: 'summer',
    categoryId: 'seasonal_timely',
    label: 'Summer',
    captionBrief: 'Summer-season trade reminder or service - timely and practical.',
    infographicHint: 'Summer seasonal content.',
    descriptionFallback: 'Summer maintenance and seasonal jobs',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'winter',
    categoryId: 'seasonal_timely',
    label: 'Winter',
    captionBrief: 'Winter-season advice or services - keep homes safe and comfortable.',
    infographicHint: 'Winter seasonal content.',
    descriptionFallback: 'Winter preparation and seasonal work',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'storms',
    categoryId: 'seasonal_timely',
    label: 'Storms',
    captionBrief: 'Storm season readiness or post-storm help - calm, capable, local.',
    infographicHint: 'Storm-related trade advice or response.',
    descriptionFallback: 'Storm season electrical and safety checks',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'holidays',
    categoryId: 'seasonal_timely',
    label: 'Holidays',
    captionBrief: 'Holiday-hours or seasonal greeting - warm, professional, local business.',
    infographicHint: 'Holiday timing or greeting post.',
    descriptionFallback: 'Holiday season message from our team',
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'none', infographicPreset: 'did_you_know' },
  },

  // Trust & Expertise (4)
  {
    id: 'licensing',
    categoryId: 'trust_expertise',
    label: 'Licensing',
    captionBrief: 'Licensed, qualified, compliant - credentials without bragging.',
    infographicHint: 'Licensing and qualification trust message.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'safety',
    categoryId: 'trust_expertise',
    label: 'Safety',
    captionBrief: 'Safety-first messaging - how you protect customers and crew.',
    infographicHint: 'Safety standards and practices.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'why_choose_us',
    categoryId: 'trust_expertise',
    label: 'Why Choose Us',
    captionBrief: 'Why choose this business - differentiators, local trust, quality.',
    infographicHint: 'Reasons to choose the business.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'process',
    categoryId: 'trust_expertise',
    label: 'Process',
    captionBrief: 'Your customer process from enquiry to done - clear expectations.',
    infographicHint: 'Step-by-step customer journey.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'process_steps' },
  },

  // Rebates & Savings (3)
  {
    id: 'rebates',
    categoryId: 'rebates_savings',
    label: 'Rebates',
    captionBrief: 'Government or utility rebates customers may qualify for - informative, not financial advice.',
    infographicHint: 'Rebate programs overview (general).',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'energy_savings',
    categoryId: 'rebates_savings',
    label: 'Energy Savings',
    captionBrief: 'Energy-saving upgrades or tips - lower bills, better comfort.',
    infographicHint: 'Energy efficiency savings angle.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'cost_advice',
    categoryId: 'rebates_savings',
    label: 'Cost Advice',
    captionBrief: 'Honest cost guidance - what affects price, value over cheap fixes.',
    infographicHint: 'Cost and value education for customers.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
] as const

export type PostSubtypeId = (typeof POST_SUBTYPE_DEFINITIONS)[number]['id']

export type PostSubtypeDefinition = (typeof POST_SUBTYPE_DEFINITIONS)[number]

export const DEFAULT_POST_SUBTYPE_ID: PostSubtypeId = 'completed_job'

const CATEGORY_IDS = new Set<string>(POST_CATEGORIES.map((c) => c.id))
const SUBTYPE_BY_ID = new Map<PostSubtypeId, PostSubtypeDefinition>(
  POST_SUBTYPE_DEFINITIONS.map((d) => [d.id, d]),
)

/** Sub-types grouped by category (UI tab panels). */
export const POST_SUBTYPES_BY_CATEGORY: Record<
  PostCategoryId,
  readonly { id: PostSubtypeId; label: string }[]
> = POST_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = POST_SUBTYPE_DEFINITIONS.filter((s) => s.categoryId === cat.id).map(
      (s) => ({ id: s.id, label: s.label }),
    )
    return acc
  },
  {} as Record<PostCategoryId, readonly { id: PostSubtypeId; label: string }[]>,
)

// ── Validators & lookups ──────────────────────────────────────────────────────

export function isPostCategoryId(value: string): value is PostCategoryId {
  return CATEGORY_IDS.has(value)
}

export function isPostSubtypeId(value: string): value is PostSubtypeId {
  return SUBTYPE_BY_ID.has(value as PostSubtypeId)
}

export function getPostSubtypeDefinition(id: PostSubtypeId): PostSubtypeDefinition {
  const def = SUBTYPE_BY_ID.get(id)
  if (!def) throw new Error(`Unknown post subtype: ${id}`)
  return def
}

export function getCategoryIdForSubtype(id: PostSubtypeId): PostCategoryId {
  return getPostSubtypeDefinition(id).categoryId
}

export function getSubtypesForCategory(
  categoryId: PostCategoryId,
): readonly { id: PostSubtypeId; label: string }[] {
  return POST_SUBTYPES_BY_CATEGORY[categoryId] ?? []
}

export function postSubtypeLabel(id: PostSubtypeId): string {
  return getPostSubtypeDefinition(id).label
}

export function postOccasionLabel(categoryId: PostCategoryId, subtypeId: PostSubtypeId): string {
  const cat = POST_CATEGORY_LABELS[categoryId]
  const sub = postSubtypeLabel(subtypeId)
  return `${cat} - ${sub}`
}

/** First subtype in category (stable default when switching tabs). */
export function defaultSubtypeForCategory(categoryId: PostCategoryId): PostSubtypeId {
  const list = POST_SUBTYPES_BY_CATEGORY[categoryId]
  if (!list?.length) return DEFAULT_POST_SUBTYPE_ID
  return list[0].id
}

/**
 * Social compose occasion taxonomy (Vendl: food / produce sellers) - 12 categories × 42 sub-types.
 * Single source of truth for Step 1 picker, compose soft defaults, and AI hints.
 *
 * Note: `before_after_job` is a finished-job photo post - not the paid
 * Before & After Render product (`before_after_comparison` infographic preset).
 */

import type { AiImagePurpose } from '@/lib/social/aiImageStyles'

// ── Categories (12) ───────────────────────────────────────────────────────────

export const POST_CATEGORIES = [
  { id: 'show_our_work',      label: 'Show What We Make' },
  { id: 'promote_service',    label: 'Promote a Product' },
  { id: 'educate_customers',  label: 'Educate Customers' },
  { id: 'problem_solution',   label: 'Questions & Answers' },
  { id: 'promotions',         label: 'Promotions' },
  { id: 'customer_success',   label: 'Happy Customers' },
  { id: 'products_equipment', label: 'Products & Produce' },
  { id: 'meet_business',      label: 'Meet the Business' },
  { id: 'local_community',    label: 'Local Community' },
  { id: 'seasonal_timely',    label: 'Seasonal & Timely' },
  { id: 'trust_expertise',    label: 'Trust & Quality' },
  { id: 'rebates_savings',    label: 'Ordering & Value' },
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
    label: 'Fresh Today',
    captionBrief: 'Show today\'s fresh batch or harvest - proud, mouth-watering, honest.',
    infographicHint: 'Focus on the finished product and why it\'s worth ordering.',
    descriptionFallback: null,
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },
  {
    id: 'before_after_job',
    categoryId: 'show_our_work',
    label: 'From Scratch',
    captionBrief: 'Show ingredients or raw produce becoming the finished product - real, not staged.',
    infographicHint: 'Contrast raw ingredients with the finished product.',
    descriptionFallback: 'From raw ingredients to the finished product',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'before_after_comparison' },
  },
  {
    id: 'work_in_progress',
    categoryId: 'show_our_work',
    label: 'In the Making',
    captionBrief: 'Mid-bake, mid-harvest or mid-prep - the care and craft going into it.',
    infographicHint: 'Highlight hands-on making and craft.',
    descriptionFallback: 'Behind the scenes while we make this week\'s batch',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },
  {
    id: 'big_project',
    categoryId: 'show_our_work',
    label: 'Big Batch',
    captionBrief: 'A big bake, harvest or market-day prep - scale, effort and pride.',
    infographicHint: 'Stress the volume and effort behind a big batch or market day.',
    descriptionFallback: 'Big batch ready for market day',
    suggestJobPicker: true,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'process_steps' },
  },

  // Promote a Service (4)
  {
    id: 'service_spotlight',
    categoryId: 'promote_service',
    label: 'Product Spotlight',
    captionBrief: 'Spotlight one product - what it is, what makes it special, how to order.',
    infographicHint: 'Explain one product clearly and why customers love it.',
    descriptionFallback: null,
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },
  {
    id: 'emergency_service',
    categoryId: 'promote_service',
    label: 'Last Chance',
    captionBrief: 'Limited stock or a closing order window - honest urgency, no pressure.',
    infographicHint: 'Urgency without hype; emphasise the order-by time.',
    descriptionFallback: 'Last chance to order this week',
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },
  {
    id: 'installation',
    categoryId: 'promote_service',
    label: 'New Product',
    captionBrief: 'Launch something new - what it is, why you made it, how to get it.',
    infographicHint: 'New product launch and what customers get.',
    descriptionFallback: 'Something new on the menu',
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'process_steps' },
  },
  {
    id: 'repair',
    categoryId: 'promote_service',
    label: 'Back in Stock',
    captionBrief: 'A favourite is back - welcome it back and tell people how to grab one.',
    infographicHint: 'Back-in-stock announcement with how to order.',
    descriptionFallback: 'Back in stock this week',
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'checklist' },
  },

  // Educate Customers (4)
  {
    id: 'tips',
    categoryId: 'educate_customers',
    label: 'Tips',
    captionBrief: 'Practical tips customers can use - storing, cooking, serving or using your products.',
    infographicHint: 'Short actionable tips list.',
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
    infographicHint: 'FAQ-style content about ordering, collection and products.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'how_it_works',
    categoryId: 'educate_customers',
    label: 'How Ordering Works',
    captionBrief: 'Explain how to order, pre-order or subscribe and then collect - simple steps, no jargon.',
    infographicHint: 'Step-by-step: order online, pay, collect.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'process_steps' },
  },
  {
    id: 'myths',
    categoryId: 'educate_customers',
    label: 'Myths',
    captionBrief: 'Bust a common food or produce myth - educate and build trust.',
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
    label: 'How We Choose',
    captionBrief: 'How you pick, source or check quality - expert eyes, clear explanation.',
    infographicHint: 'How the business selects and checks quality.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'process_steps' },
  },
  {
    id: 'warning_signs',
    categoryId: 'problem_solution',
    label: 'Freshness Signs',
    captionBrief: 'How to tell fresh, quality produce or bakes - helpful, not preachy.',
    infographicHint: 'List the signs of freshness and quality.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'common_problems',
    categoryId: 'problem_solution',
    label: 'Common Questions',
    captionBrief: 'Common customer questions or worries - relatable, with your answer.',
    infographicHint: 'Common concerns and how the business handles them.',
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
    descriptionFallback: 'Special offer - order online today',
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
    label: 'Order Window',
    captionBrief: 'Pre-orders open or collection day coming up - order before it closes.',
    infographicHint: 'Order window / collection day promotion.',
    descriptionFallback: 'Pre-orders open now - order before they close',
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'seasonal_campaign',
    categoryId: 'promotions',
    label: 'Seasonal Special',
    captionBrief: 'Seasonal special tied to the time of year or what\'s in season.',
    infographicHint: 'Seasonal promotional campaign.',
    descriptionFallback: 'Seasonal special - order online',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },

  // Customer Success (3)
  {
    id: 'review',
    categoryId: 'customer_success',
    label: 'Review',
    captionBrief: 'Share a 5-star review - grateful, authentic, local pride.',
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
    captionBrief: 'Customer testimonial - their words about your products.',
    infographicHint: 'Testimonial-style social proof.',
    descriptionFallback: 'What our customers say',
    suggestJobPicker: true,
    aiPurpose: 'review' as AiImagePurpose,
    composeDefaults: { format: 'quote_card', photoSource: 'job', infographicPreset: 'did_you_know' },
  },
  {
    id: 'customer_story',
    categoryId: 'customer_success',
    label: 'Customer Story',
    captionBrief: 'Short customer story - who they are, what they love, why they keep coming back.',
    infographicHint: 'Narrative customer story.',
    descriptionFallback: 'Why our regulars keep coming back',
    suggestJobPicker: true,
    aiPurpose: 'review' as AiImagePurpose,
    composeDefaults: { format: 'quote_card', photoSource: 'job', infographicPreset: 'process_steps' },
  },

  // Products & Equipment (3)
  {
    id: 'product_spotlight',
    categoryId: 'products_equipment',
    label: 'Ingredient Spotlight',
    captionBrief: 'Spotlight an ingredient, variety or supplier you use - quality you stand behind.',
    infographicHint: 'Ingredient or variety spotlight.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'job_showcase' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },
  {
    id: 'recommendation',
    categoryId: 'products_equipment',
    label: 'Pairing Ideas',
    captionBrief: 'Suggest what goes well with your products - recipes, pairings, serving ideas.',
    infographicHint: 'Pairing or serving recommendations.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'new_equipment',
    categoryId: 'products_equipment',
    label: 'New Gear',
    captionBrief: 'A new oven, equipment, stall setup or packaging that helps you do better.',
    infographicHint: 'New equipment or setup for the business.',
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
    captionBrief: 'Introduce the people behind the stall or kitchen - real and approachable.',
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
    captionBrief: 'Behind the scenes - early starts, prep, harvest and the care in every batch.',
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
    captionBrief: 'Business milestone - years trading, orders filled, community thanks.',
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
    label: 'Local Area',
    captionBrief: 'Local area focus - proud to feed and serve your neighbours.',
    infographicHint: 'Local area / delivery area post.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'job', infographicPreset: 'checklist' },
  },
  {
    id: 'sponsorship',
    categoryId: 'local_community',
    label: 'Sponsorship',
    captionBrief: 'Community support - giving back locally (school fetes, clubs, charities).',
    infographicHint: 'Community support announcement.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'ai_generate', infographicPreset: 'did_you_know' },
  },
  {
    id: 'local_event',
    categoryId: 'local_community',
    label: 'Market Day',
    captionBrief: 'Markets, events or pop-ups you\'ll be at - where, when and what you\'ll bring.',
    infographicHint: 'Market or event appearance.',
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
    captionBrief: 'What\'s in season and summer favourites - timely and practical.',
    infographicHint: 'Summer seasonal content.',
    descriptionFallback: 'Summer favourites and what\'s in season',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'winter',
    categoryId: 'seasonal_timely',
    label: 'Winter',
    captionBrief: 'Comfort food, winter produce or firewood season - timely and practical.',
    infographicHint: 'Winter seasonal content.',
    descriptionFallback: 'Winter favourites and seasonal produce',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'storms',
    categoryId: 'seasonal_timely',
    label: 'Weather',
    captionBrief: 'Weather changes to collection or trading - calm, clear and helpful.',
    infographicHint: 'Weather-related trading update.',
    descriptionFallback: 'Weather update for this week\'s collection',
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'holidays',
    categoryId: 'seasonal_timely',
    label: 'Holidays',
    captionBrief: 'Holiday hours, Christmas or Easter orders, or a seasonal greeting - warm and local.',
    infographicHint: 'Holiday timing or greeting post.',
    descriptionFallback: 'Holiday orders and trading hours',
    suggestJobPicker: false,
    aiPurpose: 'team' as AiImagePurpose,
    composeDefaults: { format: 'scene', photoSource: 'none', infographicPreset: 'did_you_know' },
  },

  // Trust & Expertise (4)
  {
    id: 'licensing',
    categoryId: 'trust_expertise',
    label: 'Food Safety',
    captionBrief: 'Registered, food-safe and compliant - credentials without bragging.',
    infographicHint: 'Food safety registration and trust message.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'safety',
    categoryId: 'trust_expertise',
    label: 'Hygiene & Care',
    captionBrief: 'How you keep food safe and fresh - handling, storage, packaging.',
    infographicHint: 'Hygiene and handling practices.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'why_choose_us',
    categoryId: 'trust_expertise',
    label: 'Why Choose Us',
    captionBrief: 'Why choose this business - local, fresh, made with care.',
    infographicHint: 'Reasons to choose the business.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'process',
    categoryId: 'trust_expertise',
    label: 'From Order to Collection',
    captionBrief: 'Your customer journey from ordering to collection or delivery - clear expectations.',
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
    label: 'Subscriptions',
    captionBrief: 'Subscription boxes or memberships - regular orders, less hassle, a little saving.',
    infographicHint: 'Subscription or membership benefits.',
    descriptionFallback: 'Subscribe for a regular box',
    suggestJobPicker: true,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'did_you_know' },
  },
  {
    id: 'energy_savings',
    categoryId: 'rebates_savings',
    label: 'Buy Local Value',
    captionBrief: 'Why buying direct from a local producer is good value - fresher, less waste, fair prices.',
    infographicHint: 'Value of buying local, direct.',
    descriptionFallback: null,
    suggestJobPicker: false,
    aiPurpose: 'promo' as AiImagePurpose,
    composeDefaults: { format: 'infographic', photoSource: 'none', infographicPreset: 'checklist' },
  },
  {
    id: 'cost_advice',
    categoryId: 'rebates_savings',
    label: 'Pricing Explained',
    captionBrief: 'Honest pricing - what goes into the price and why quality costs a bit more.',
    infographicHint: 'Price and value education.',
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

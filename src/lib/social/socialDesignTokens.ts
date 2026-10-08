/**
 * Social workspace visual tokens - format accents, category icons, platform preview hints.
 * Scoped to /social content area only; does not affect global sidebar/top bar.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  DollarSign,
  Hammer,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  Package,
  Percent,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import type { ContentFormat } from '@/lib/social/composeModel'
import type { PostCategoryId } from '@/lib/social/postTaxonomy'

export interface FormatAccent {
  id: ContentFormat
  label: string
  badgeBg: string
  badgeIcon: string
  ring: string
  surface: string
  dot: string
  Icon: LucideIcon
  blurb: string
}

export const FORMAT_ACCENTS: Record<ContentFormat, FormatAccent> = {
  scene: {
    id: 'scene',
    label: 'Scene-style',
    badgeBg: 'bg-rose-100',
    badgeIcon: 'text-rose-600',
    ring: 'ring-rose-400/40 border-rose-300',
    surface: 'bg-rose-50/80',
    dot: 'bg-rose-500',
    Icon: Camera,
    blurb: 'Hero photo + headline stack',
  },
  infographic: {
    id: 'infographic',
    label: 'Infographic-style',
    badgeBg: 'bg-indigo-100',
    badgeIcon: 'text-indigo-600',
    ring: 'ring-indigo-400/40 border-indigo-300',
    surface: 'bg-indigo-50/80',
    dot: 'bg-indigo-500',
    Icon: BarChart3,
    blurb: 'Lists, steps & educational layouts',
  },
  quote_card: {
    id: 'quote_card',
    label: 'Quote card',
    badgeBg: 'bg-teal-100',
    badgeIcon: 'text-teal-600',
    ring: 'ring-teal-400/40 border-teal-300',
    surface: 'bg-teal-50/80',
    dot: 'bg-teal-500',
    Icon: MessageSquareQuote,
    blurb: 'Customer testimonial spotlight',
  },
}

export const CATEGORY_ICONS: Record<PostCategoryId, LucideIcon> = {
  show_our_work:      Hammer,
  promote_service:    Megaphone,
  educate_customers:  BookOpen,
  problem_solution:   Lightbulb,
  promotions:         Percent,
  customer_success:   Star,
  products_equipment: Package,
  meet_business:      Users,
  local_community:    MapPin,
  seasonal_timely:    CalendarDays,
  trust_expertise:    ShieldCheck,
  rebates_savings:    DollarSign,
}

export type PreviewPlatform = 'instagram' | 'facebook' | 'gmb'

export interface PlatformPreviewTheme {
  label: string
  cornerGradient: string
  headerTint: string
  badgeBg: string
  badgeText: string
}

export const PLATFORM_PREVIEW_THEMES: Record<PreviewPlatform, PlatformPreviewTheme> = {
  instagram: {
    label: 'Instagram',
    cornerGradient: 'from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    headerTint: 'bg-gradient-to-r from-pink-50/90 to-purple-50/90',
    badgeBg: 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B]',
    badgeText: 'text-white',
  },
  facebook: {
    label: 'Facebook',
    cornerGradient: 'from-[#1877F2] to-[#0C5DC7]',
    headerTint: 'bg-blue-50/90',
    badgeBg: 'bg-[#1877F2]',
    badgeText: 'text-white',
  },
  gmb: {
    label: 'Google Business',
    cornerGradient: 'from-[#34A853] to-[#1E8E3E]',
    headerTint: 'bg-emerald-50/90',
    badgeBg: 'bg-[#34A853]',
    badgeText: 'text-white',
  },
}

export const COMPOSE_STEP_CARD =
  'rounded-2xl border border-[#EDEAE2]/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md overflow-hidden'

export const COMPOSE_STEP_HEADER =
  'border-b border-[#F0EDE5]/80 bg-gradient-to-r from-[#FAFAF7] to-white px-4 py-3.5'

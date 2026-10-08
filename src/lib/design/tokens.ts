/**
 * StitchedUp design tokens - app-wide foundation.
 * Gold core (#FFD100), warm neutrals, 4-level elevation scale.
 * Social format accents (rose/indigo/teal) stay in lib/social/socialDesignTokens.ts only.
 */

export const colors = {
  brand: {
    black: '#0A0A0A',
    yellow: '#FFD100',
    white: '#FFFFFF',
  },
  surface: {
    page: '#F7F5EF',
    card: '#FFFFFF',
    nested: '#FAFAF7',
    warmTint: '#FFFBEA',
  },
  border: {
    default: '#EDEAE2',
    subtle: '#F0EDE5',
    input: '#E0DDD5',
    hover: '#D5D0C8',
  },
  text: {
    primary: '#111111',
    secondary: '#444444',
    tertiary: '#666666',
    muted: '#888888',
    hint: '#999999',
  },
} as const

/** Tailwind shadow-elevation-* scale (see tailwind.config.ts boxShadow) */
export const elevation = {
  none: 'shadow-elevation-none',
  rest: 'shadow-elevation-rest',
  raised: 'shadow-elevation-raised',
  float: 'shadow-elevation-float',
} as const

export type ElevationLevel = keyof typeof elevation

export const elevationHover: Record<ElevationLevel, string> = {
  none: elevation.none,
  rest: `${elevation.rest} hover:shadow-elevation-raised`,
  raised: `${elevation.raised} hover:shadow-elevation-float`,
  float: elevation.float,
}

export const motion = {
  shadow: 'transition-shadow duration-200',
  all: 'transition-all duration-200',
  colors: 'transition-colors duration-150',
} as const

export const radius = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  pill: 'rounded-full',
} as const

/** Default dashboard card base (elevation applied by Card component) */
export const CARD_SURFACE = [radius.xl, 'border border-warm-border bg-white'].join(' ')

/** Nested panel - no shadow, warm nested bg */
export const CARD_NESTED = [
  radius.xl,
  'border border-warm-border bg-surface-nested',
  elevation.none,
].join(' ')

/** Page chrome header strip */
export const PAGE_HEADER = 'border-b border-warm-border bg-white'

/** Section micro-label */
export const SECTION_LABEL =
  'text-xs font-black uppercase tracking-widest text-[#666]'

/** Sidebar active nav item */
export const SIDEBAR_ACTIVE = 'text-[#FFD100] bg-[#FFD100]/[0.08] font-semibold'
export const SIDEBAR_ACTIVE_BAR =
  'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FFD100]'

/** Mobile bottom nav - mirrors sidebar active treatment */
export const MOBILE_NAV_ACTIVE = SIDEBAR_ACTIVE
export const MOBILE_NAV_ACTIVE_BAR =
  'absolute left-1/2 top-0 h-[3px] w-7 -translate-x-1/2 rounded-b-full bg-[#FFD100]'
export const MOBILE_NAV_INACTIVE =
  'text-[#6B6B6B] hover:bg-white/[0.04] hover:text-white'

/** Top bar dropdown panel */
export const DROPDOWN_PANEL = [
  radius.xl,
  'border border-warm-input bg-white',
  elevation.float,
].join(' ')

/** Gold selection state (pills, cards, toggles) */
export const SELECTABLE_SELECTED = [
  'border-[#FFD100] bg-[#FFFBEA] ring-2 ring-[#FFD100]/25',
  elevation.rest,
  'scale-[1.02]',
].join(' ')

export const SELECTABLE_SELECTED_CLASSES = {
  border: 'border-[#FFD100]',
  bg: 'bg-[#FFFBEA]',
  ring: 'ring-2 ring-[#FFD100]/25',
  shadow: elevation.rest,
  scale: 'scale-[1.02]',
} as const

export const SELECTABLE_UNSELECTED = [
  'border border-warm-input bg-white text-[#555]',
  'hover:border-[#CCC] hover:shadow-elevation-rest hover:scale-[1.01]',
].join(' ')

export const SELECTABLE_PILL_SELECTED = 'bg-[#FFD100] text-[#0A0A0A]'
export const SELECTABLE_PILL_UNSELECTED =
  'border border-warm-input bg-white text-[#555] hover:border-[#CCC]'

export function selectablePillClass(selected: boolean, disabled?: boolean): string {
  return `${selected ? SELECTABLE_PILL_SELECTED : SELECTABLE_PILL_UNSELECTED}${
    disabled ? ' opacity-50 cursor-not-allowed' : ''
  }`
}

/** Full pill button classes including motion */
export function selectablePillButtonClass(selected: boolean, disabled?: boolean): string {
  return [
    radius.pill,
    'px-3 py-1.5 text-[11px] font-semibold',
    motion.all,
    selectablePillClass(selected, disabled),
    selected ? elevation.rest : 'hover:scale-[1.02]',
  ].join(' ')
}

export function selectableCardClass(
  selected: boolean,
  disabled?: boolean,
  /** Social format accents only - pass e.g. "border-rose-300 bg-rose-50/80 ring-rose-400/40" */
  accentSelectedClass?: string
): string {
  const base = [
    radius.xl,
    'border text-left',
    motion.all,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
  if (selected && accentSelectedClass) {
    return [...base, accentSelectedClass, 'ring-2', elevation.rest, 'scale-[1.02]'].join(' ')
  }
  if (selected) {
    return [
      ...base,
      SELECTABLE_SELECTED_CLASSES.border,
      SELECTABLE_SELECTED_CLASSES.bg,
      SELECTABLE_SELECTED_CLASSES.ring,
      SELECTABLE_SELECTED_CLASSES.shadow,
      SELECTABLE_SELECTED_CLASSES.scale,
    ].join(' ')
  }
  return [
    ...base,
    'border-warm-border bg-white',
    'hover:border-[#D5D0C8] hover:shadow-elevation-rest hover:scale-[1.01]',
  ].join(' ')
}

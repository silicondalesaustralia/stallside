import {
  DEFAULT_SCENE_STACK_LAYOUT,
  parseSceneStackLayout,
  type SceneStackLayout,
} from '@/lib/social/sceneStackLayout'

/** Curated Google Fonts for Orshot social image text (no custom upload). */
export const SOCIAL_FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Montserrat',
  'Poppins',
  'Oswald',
  'Bebas Neue',
  'Playfair Display',
  'Open Sans',
  'Lato',
  'Raleway',
  'Merriweather',
  'Nunito',
  'Work Sans',
  'DM Sans',
  'Space Grotesk',
  'Archivo',
  'Barlow',
  'Rubik',
  'Karla',
  'Josefin Sans',
  'Libre Baskerville',
  'Crimson Text',
  'Anton',
  'Fjalla One',
] as const

export type SocialFontFamily = (typeof SOCIAL_FONT_FAMILIES)[number]

export type SocialTextElement = 'headline' | 'description' | 'tagline'

export const SOCIAL_TEXT_ELEMENTS: { id: SocialTextElement; label: string }[] = [
  { id: 'headline',    label: 'Headline' },
  { id: 'description', label: 'Description' },
  { id: 'tagline',     label: 'Tagline' },
]

/** Stored color: hex, or 'auto' (null in DB) to match background. */
export type SocialTextColor = string

export interface SocialElementStyle {
  fontFamily: SocialFontFamily
  fontSize:   number
  color:      SocialTextColor
  bold?:      boolean
  italic?:    boolean
  underline?: boolean
}

/** Headline defaults bold (matches existing scene overlay). Tagline/description do not. */
export function defaultElementBold(element: SocialTextElement): boolean {
  return element === 'headline'
}

export function styleBold(style: SocialElementStyle, element: SocialTextElement): boolean {
  return style.bold ?? defaultElementBold(element)
}

export function styleItalic(style: SocialElementStyle): boolean {
  return style.italic === true
}

export function styleUnderline(style: SocialElementStyle): boolean {
  return style.underline === true
}

export type SocialTextStyles = {
  headline: SocialElementStyle
  description: SocialElementStyle
  tagline: SocialElementStyle
} & SceneStackLayout

export const SOCIAL_FONT_SIZE_MIN = 12
export const SOCIAL_FONT_SIZE_MAX = 80

/** UI / legacy fallback when a hex is required for display only. */
export const DEFAULT_SOCIAL_TEXT_COLOR = '#000000'

/** Sentinel for automatic contrast-based color (stored as null in DB). */
export const SOCIAL_COLOR_AUTO = 'auto' as const

/** Preset swatches for the text style color picker (Post Settings + Step 4). */
export const SOCIAL_COLOR_SWATCHES: { label: string; hex: string }[] = [
  { label: 'Black',      hex: '#000000' },
  { label: 'White',      hex: '#FFFFFF' },
  { label: 'Yellow',     hex: '#FFD100' },
  { label: 'Navy',       hex: '#1B2838' },
  { label: 'Dark blue',  hex: '#003366' },
  { label: 'Teal',       hex: '#0D9488' },
  { label: 'Green',      hex: '#16A34A' },
  { label: 'Orange',     hex: '#EA580C' },
  { label: 'Red',        hex: '#DC2626' },
  { label: 'Maroon',     hex: '#7F1D1D' },
  { label: 'Grey',       hex: '#6B7280' },
]

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

export const DEFAULT_SOCIAL_TEXT_STYLES: SocialTextStyles = {
  headline:    { fontFamily: 'Inter', fontSize: 42, color: SOCIAL_COLOR_AUTO, bold: true,  italic: false, underline: false },
  description: { fontFamily: 'Inter', fontSize: 22, color: SOCIAL_COLOR_AUTO, bold: false, italic: false, underline: false },
  tagline:     { fontFamily: 'Inter', fontSize: 20, color: SOCIAL_COLOR_AUTO, bold: false, italic: false, underline: false },
  ...DEFAULT_SCENE_STACK_LAYOUT,
}

export function isSocialFontFamily(value: string): value is SocialFontFamily {
  return (SOCIAL_FONT_FAMILIES as readonly string[]).includes(value)
}

export function normalizeSocialFontFamily(value: string | null | undefined): SocialFontFamily {
  const trimmed = value?.trim()
  if (trimmed && isSocialFontFamily(trimmed)) return trimmed
  return 'Inter'
}

export function clampFontSize(value: number): number {
  if (!Number.isFinite(value)) return SOCIAL_FONT_SIZE_MIN
  return Math.min(SOCIAL_FONT_SIZE_MAX, Math.max(SOCIAL_FONT_SIZE_MIN, Math.round(value)))
}

export function isAutoSocialColor(value: string | null | undefined): boolean {
  if (value == null) return true
  const trimmed = value.trim().toLowerCase()
  return trimmed === '' || trimmed === SOCIAL_COLOR_AUTO
}

/** Parse stored color - null / auto → SOCIAL_COLOR_AUTO; invalid hex → auto. */
export function parseSocialColor(value: unknown): SocialTextColor {
  if (value == null) return SOCIAL_COLOR_AUTO
  if (typeof value !== 'string') return SOCIAL_COLOR_AUTO
  const trimmed = value.trim()
  if (isAutoSocialColor(trimmed)) return SOCIAL_COLOR_AUTO
  if (HEX_COLOR_RE.test(trimmed)) return trimmed
  return SOCIAL_COLOR_AUTO
}

/** For native color input - falls back when auto. */
export function normalizeSocialColor(value: string | null | undefined): string {
  if (isAutoSocialColor(value)) return DEFAULT_SOCIAL_TEXT_COLOR
  const trimmed = value?.trim()
  if (trimmed && HEX_COLOR_RE.test(trimmed)) return trimmed
  return DEFAULT_SOCIAL_TEXT_COLOR
}

export function formatSocialColorLabel(color: SocialTextColor): string {
  return isAutoSocialColor(color) ? 'Auto colour' : color
}

function elementStylesEquivalent(
  a: SocialElementStyle,
  b: SocialElementStyle,
  element: SocialTextElement,
): boolean {
  return (
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize &&
    formatSocialColorLabel(a.color) === formatSocialColorLabel(b.color) &&
    styleBold(a, element) === styleBold(b, element) &&
    styleItalic(a) === styleItalic(b) &&
    styleUnderline(a) === styleUnderline(b)
  )
}

function formatEmphasisSuffix(style: SocialElementStyle, element: SocialTextElement): string {
  const bits: string[] = []
  if (styleBold(style, element)) bits.push('Bold')
  if (styleItalic(style)) bits.push('Italic')
  if (styleUnderline(style)) bits.push('Underline')
  return bits.length ? ` · ${bits.join(' / ')}` : ''
}

function formatElementStyleSegment(style: SocialElementStyle, element: SocialTextElement): string {
  return `${style.fontFamily} · ${style.fontSize}px · ${formatSocialColorLabel(style.color)}${formatEmphasisSuffix(style, element)}`
}

/** Live summary for collapsed Scene compose text-style panel (headline + tagline). */
export function formatComposeTextStylePanelSummary(
  styles: SocialTextStyles,
  elements: SocialTextElement[] = ['headline', 'tagline'],
): string {
  if (elements.length === 0) return ''

  if (elements.length === 1) {
    const only = elements[0]!
    return formatElementStyleSegment(styles[only], only)
  }

  const headline = styles.headline
  const tagline = styles.tagline
  const includesHeadline = elements.includes('headline')
  const includesTagline = elements.includes('tagline')

  if (!includesHeadline || !includesTagline) {
    const only = includesHeadline ? 'headline' : 'tagline'
    return formatElementStyleSegment(styles[only], only)
  }

  if (elementStylesEquivalent(headline, tagline, 'headline')) {
    return formatElementStyleSegment(headline, 'headline')
  }

  const sameFont = headline.fontFamily === tagline.fontFamily

  if (sameFont && headline.fontSize === tagline.fontSize) {
    return `${headline.fontFamily} · ${headline.fontSize}px · ${formatSocialColorLabel(headline.color)} · Tagline: ${formatSocialColorLabel(tagline.color)}`
  }

  if (sameFont) {
    return `${headline.fontFamily} · ${headline.fontSize}px · ${formatSocialColorLabel(headline.color)} · Tagline: ${tagline.fontSize}px · ${formatSocialColorLabel(tagline.color)}`
  }

  return `Headline: ${formatElementStyleSegment(headline, 'headline')} · Tagline: ${formatElementStyleSegment(tagline, 'tagline')}`
}

function parseElementStyle(
  raw: unknown,
  fallback: SocialElementStyle,
): SocialElementStyle {
  if (!raw || typeof raw !== 'object') return fallback
  const obj = raw as {
    fontFamily?: unknown
    fontSize?: unknown
    color?: unknown
    bold?: unknown
    italic?: unknown
    underline?: unknown
  }
  return {
    fontFamily: normalizeSocialFontFamily(
      typeof obj.fontFamily === 'string' ? obj.fontFamily : fallback.fontFamily,
    ),
    fontSize: clampFontSize(
      typeof obj.fontSize === 'number'
        ? obj.fontSize
        : typeof obj.fontSize === 'string'
          ? Number(obj.fontSize)
          : fallback.fontSize,
    ),
    color: parseSocialColor(
      'color' in obj ? obj.color : fallback.color,
    ),
    bold: typeof obj.bold === 'boolean' ? obj.bold : fallback.bold,
    italic: typeof obj.italic === 'boolean' ? obj.italic : fallback.italic,
    underline: typeof obj.underline === 'boolean' ? obj.underline : fallback.underline,
  }
}

export function parseSocialTextStyles(raw: unknown): SocialTextStyles {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SOCIAL_TEXT_STYLES }
  const obj = raw as Partial<Record<SocialTextElement, unknown>>
  return {
    headline:    parseElementStyle(obj.headline,    DEFAULT_SOCIAL_TEXT_STYLES.headline),
    description: parseElementStyle(obj.description, DEFAULT_SOCIAL_TEXT_STYLES.description),
    tagline:     parseElementStyle(obj.tagline,     DEFAULT_SOCIAL_TEXT_STYLES.tagline),
    ...parseSceneStackLayout(raw),
  }
}

export type PartialSocialTextStyles = {
  [K in SocialTextElement]?: Partial<SocialElementStyle>
} & Partial<SceneStackLayout>

export interface SceneColorExplicitFlags {
  headline: boolean
  tagline: boolean
}

function rawElementHasExplicitColor(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const obj = raw as { color?: unknown }
  if (!('color' in obj)) return false
  return !isAutoSocialColor(
    typeof obj.color === 'string' ? obj.color : null,
  )
}

/** Detect user-chosen colors (business save or per-post override). Legacy #000000 → auto. */
export function getSceneColorExplicitFlags(input: {
  businessRaw?: unknown
  override?: PartialSocialTextStyles | null
}): SceneColorExplicitFlags {
  const businessObj =
    input.businessRaw && typeof input.businessRaw === 'object'
      ? (input.businessRaw as Partial<Record<SocialTextElement, unknown>>)
      : null
  const override = input.override ?? {}

  const businessExplicit = (el: SocialTextElement): boolean =>
    rawElementHasExplicitColor(businessObj?.[el])

  const overrideExplicit = (el: SocialTextElement): boolean =>
    rawElementHasExplicitColor(override[el])

  return {
    headline: overrideExplicit('headline') || businessExplicit('headline'),
    tagline: overrideExplicit('tagline') || businessExplicit('tagline'),
  }
}

/** Per element: Step 4 override → business social_text_styles → default. */
export function resolveSocialTextStyles(input: {
  override?: PartialSocialTextStyles | null
  business?: SocialTextStyles | null
}): SocialTextStyles {
  const base = input.business ?? DEFAULT_SOCIAL_TEXT_STYLES
  const override = input.override ?? {}

  const resolveElement = (element: SocialTextElement): SocialElementStyle => {
    const businessStyle = base[element]
    const o = override[element]
    return {
      fontFamily: normalizeSocialFontFamily(o?.fontFamily ?? businessStyle.fontFamily),
      fontSize:   clampFontSize(o?.fontSize ?? businessStyle.fontSize),
      color:      o?.color !== undefined
        ? parseSocialColor(o.color)
        : businessStyle.color,
      bold:      o?.bold ?? businessStyle.bold ?? defaultElementBold(element),
      italic:    o?.italic ?? businessStyle.italic ?? false,
      underline: o?.underline ?? businessStyle.underline ?? false,
    }
  }

  const layout = parseSceneStackLayout({
    stackAnchor: override.stackAnchor ?? base.stackAnchor,
    stackOffsetX: override.stackOffsetX ?? base.stackOffsetX,
    stackOffsetY: override.stackOffsetY ?? base.stackOffsetY,
  })

  return {
    headline:    resolveElement('headline'),
    description: resolveElement('description'),
    tagline:     resolveElement('tagline'),
    ...layout,
  }
}

export interface SceneRenderTextStyles extends SocialTextStyles {
  /** Resolved hex colors for SVG fill (auto already replaced). */
}

/** Apply auto contrast colors for scene render; respects explicit flags. */
export function applySceneRenderTextColors(input: {
  resolved: SocialTextStyles
  explicit: SceneColorExplicitFlags
  autoHeadlineColor: string
  autoTaglineColor: string
}): SceneRenderTextStyles {
  const headlineColor =
    !input.explicit.headline && isAutoSocialColor(input.resolved.headline.color)
      ? input.autoHeadlineColor
      : normalizeSocialColor(input.resolved.headline.color)

  const taglineColor =
    !input.explicit.tagline && isAutoSocialColor(input.resolved.tagline.color)
      ? input.autoTaglineColor
      : normalizeSocialColor(input.resolved.tagline.color)

  return {
    ...input.resolved,
    headline: { ...input.resolved.headline, color: headlineColor },
    tagline: { ...input.resolved.tagline, color: taglineColor },
  }
}

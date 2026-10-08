import type { PostSubtypeId } from '@/lib/social/postTaxonomy'
import { getCategoryIdForSubtype } from '@/lib/social/postTaxonomy'

export const INFOGRAPHIC_VISUAL_THEME_IDS = [
  'default',
  'seasonal_winter',
  'seasonal_summer',
  'promotional',
  'educational',
  'trust',
] as const

export type InfographicVisualThemeId = (typeof INFOGRAPHIC_VISUAL_THEME_IDS)[number]

export interface SeasonalPalette {
  bgTop: string
  bgMid: string
  bgBottom: string
  /** Primary decorative glow (top-right blob) */
  glowPrimary: string
  /** Secondary decorative glow */
  glowSecondary: string
  panelTop: string
  panelBottom: string
  /** Panel top accent stripe - often season-tinted */
  panelAccent: string
  /** Eyebrow label colour */
  eyebrowColor: string
  /** Brand yellow wash strength (0 = none) */
  brandWashOpacity: number
  seasonOverlay: string | null
  seasonOverlayOpacity: number
}

export interface ResolvedInfographicTheme {
  id: InfographicVisualThemeId
  /** Seasonal / accent tint (hex) layered on background */
  accentTint: string | null
  /** Decorative motif key */
  motif: 'none' | 'winter' | 'summer' | 'spark'
  palette: SeasonalPalette
}

const DEFAULT_PALETTE: SeasonalPalette = {
  bgTop: '#1B2838',
  bgMid: '#121820',
  bgBottom: '#0A0A0A',
  glowPrimary: 'rgba(255,209,0,0.22)',
  glowSecondary: 'rgba(255,209,0,0.14)',
  panelTop: '#141820',
  panelBottom: '#0A0A0A',
  panelAccent: '#FFD100',
  eyebrowColor: '#FFD100',
  brandWashOpacity: 0.18,
  seasonOverlay: null,
  seasonOverlayOpacity: 0,
}

const WINTER_PALETTE: SeasonalPalette = {
  bgTop: '#152A45',
  bgMid: '#0C1F38',
  bgBottom: '#061525',
  glowPrimary: 'rgba(224,242,254,0.35)',
  glowSecondary: 'rgba(125,211,252,0.28)',
  panelTop: '#122338',
  panelBottom: '#081828',
  panelAccent: '#7DD3FC',
  eyebrowColor: '#93C5FD',
  brandWashOpacity: 0.05,
  seasonOverlay: '#2563EB',
  seasonOverlayOpacity: 0.14,
}

const SUMMER_PALETTE: SeasonalPalette = {
  bgTop: '#4A2E14',
  bgMid: '#301C0C',
  bgBottom: '#1A0E06',
  glowPrimary: 'rgba(253,186,116,0.42)',
  glowSecondary: 'rgba(234,88,12,0.32)',
  panelTop: '#3A2414',
  panelBottom: '#1E1208',
  panelAccent: '#FB923C',
  eyebrowColor: '#FDBA74',
  brandWashOpacity: 0.12,
  seasonOverlay: '#EA580C',
  seasonOverlayOpacity: 0.16,
}

const SUBTYPE_THEME: Partial<Record<PostSubtypeId, InfographicVisualThemeId>> = {
  winter: 'seasonal_winter',
  summer: 'seasonal_summer',
  seasonal_campaign: 'promotional',
  tips: 'educational',
  myths: 'educational',
  faq: 'educational',
  how_it_works: 'educational',
  review: 'trust',
  testimonial: 'trust',
}

export function themeFromPostSubtype(subtype?: PostSubtypeId | null): InfographicVisualThemeId | null {
  if (!subtype) return null
  if (SUBTYPE_THEME[subtype]) return SUBTYPE_THEME[subtype]!
  const cat = getCategoryIdForSubtype(subtype)
  if (cat === 'seasonal_timely') return 'seasonal_winter'
  if (cat === 'educate_customers') return 'educational'
  if (cat === 'promotions') return 'promotional'
  if (cat === 'trust_expertise' || cat === 'customer_success') return 'trust'
  return null
}

export function resolveInfographicTheme(input: {
  visualTheme?: InfographicVisualThemeId | null
  postSubtype?: PostSubtypeId | null
}): ResolvedInfographicTheme {
  const id =
    input.visualTheme ??
    themeFromPostSubtype(input.postSubtype) ??
    'default'

  switch (id) {
    case 'seasonal_winter':
      return { id, accentTint: '#7DD3FC', motif: 'winter', palette: WINTER_PALETTE }
    case 'seasonal_summer':
      return { id, accentTint: '#FDBA74', motif: 'summer', palette: SUMMER_PALETTE }
    case 'promotional':
      return { id, accentTint: null, motif: 'spark', palette: DEFAULT_PALETTE }
    case 'trust':
      return { id, accentTint: null, motif: 'none', palette: DEFAULT_PALETTE }
    case 'educational':
      return { id, accentTint: '#A5B4FC', motif: 'none', palette: DEFAULT_PALETTE }
    default:
      return { id: 'default', accentTint: null, motif: 'none', palette: DEFAULT_PALETTE }
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Mix brand into a dark gradient stop (simple hex blend approximation). */
export function brandGlowColor(brandHex: string, opacity = 0.35): string {
  const h = brandHex.replace('#', '').trim()
  if (h.length !== 6) return '#FFD100'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export function buildInfographicBackground(
  width: number,
  height: number,
  transparent: boolean,
  brand: string,
  theme: ResolvedInfographicTheme,
): string {
  if (transparent) {
    return `<rect width="100%" height="100%" fill="#000000" fill-opacity="0.35"/>`
  }

  const p = theme.palette
  const brandGlow = brandGlowColor(brand, p.brandWashOpacity)

  let motifs = ''
  if (theme.motif === 'winter') {
    const icy = theme.accentTint ?? '#7DD3FC'
    motifs = `
    <circle cx="${width * 0.88}" cy="${height * 0.11}" r="${Math.round(width * 0.2)}" fill="${p.glowPrimary}"/>
    <circle cx="${width * 0.82}" cy="${height * 0.08}" r="${Math.round(width * 0.1)}" fill="${p.glowSecondary}"/>
    <circle cx="${width * 0.1}" cy="${height * 0.82}" r="${Math.round(width * 0.14)}" fill="${p.glowSecondary}" fill-opacity="0.5"/>
    <g transform="translate(${width * 0.9}, ${height * 0.05}) scale(${width / 1080 * 1.1})" opacity="0.35">
      <path d="M12 3 V21 M5 7 L19 17 M19 7 L5 17 M3 12 H21" fill="none" stroke="${icy}" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g transform="translate(${width * 0.04}, ${height * 0.12}) scale(${width / 1080 * 0.7})" opacity="0.22">
      <path d="M12 3 V21 M5 7 L19 17 M19 7 L5 17 M3 12 H21" fill="none" stroke="#E0F2FE" stroke-width="1.6" stroke-linecap="round"/>
    </g>`
  } else if (theme.motif === 'summer') {
    const warm = theme.accentTint ?? '#FDBA74'
    motifs = `
    <circle cx="${width * 0.86}" cy="${height * 0.12}" r="${Math.round(width * 0.22)}" fill="${p.glowPrimary}"/>
    <circle cx="${width * 0.78}" cy="${height * 0.06}" r="${Math.round(width * 0.11)}" fill="${p.glowSecondary}"/>
    <circle cx="${width * 0.12}" cy="${height * 0.88}" r="${Math.round(width * 0.16)}" fill="${p.glowPrimary}" fill-opacity="0.55"/>
    <g transform="translate(${width * 0.88}, ${height * 0.04}) scale(${width / 1080 * 1.0})" opacity="0.45">
      <circle cx="12" cy="12" r="5" fill="none" stroke="${warm}" stroke-width="1.5"/>
      <path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.5 4.5 L6.5 6.5 M17.5 17.5 L19.5 19.5 M19.5 4.5 L17.5 6.5 M6.5 17.5 L4.5 19.5" fill="none" stroke="${warm}" stroke-width="1.5" stroke-linecap="round"/>
    </g>`
  } else {
    motifs = `
    <circle cx="${width * 0.92}" cy="${height * 0.1}" r="${Math.round(width * 0.18)}" fill="${brandGlow}"/>
    <circle cx="${width * 0.08}" cy="${height * 0.88}" r="${Math.round(width * 0.12)}" fill="${brandGlow}" fill-opacity="0.6"/>`
  }

  return `
  <defs>
    <linearGradient id="infoBg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${p.bgTop}"/>
      <stop offset="50%" stop-color="${p.bgMid}"/>
      <stop offset="100%" stop-color="${p.bgBottom}"/>
    </linearGradient>
    <linearGradient id="brandWash" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${brand}" stop-opacity="${p.brandWashOpacity}"/>
      <stop offset="100%" stop-color="${brand}" stop-opacity="0"/>
    </linearGradient>
    ${p.seasonOverlay ? `<linearGradient id="seasonTint" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${p.seasonOverlay}" stop-opacity="${p.seasonOverlayOpacity}"/>
      <stop offset="55%" stop-color="${p.seasonOverlay}" stop-opacity="0"/>
    </linearGradient>` : ''}
  </defs>
  <rect width="100%" height="100%" fill="url(#infoBg)"/>
  <rect width="100%" height="100%" fill="url(#brandWash)"/>
  ${p.seasonOverlay ? `<rect width="100%" height="100%" fill="url(#seasonTint)"/>` : ''}
  ${motifs}`
}

export function themeEyebrowLabel(theme: ResolvedInfographicTheme): string | null {
  switch (theme.id) {
    case 'seasonal_winter':
      return 'WINTER READY'
    case 'seasonal_summer':
      return 'SUMMER TIPS'
    case 'promotional':
      return 'SPECIAL OFFER'
    case 'trust':
      return 'TRUSTED LOCAL'
    case 'educational':
      return 'PRO TIPS'
    default:
      return null
  }
}

export function titleHeaderSvg(
  x: number,
  y: number,
  title: string,
  fontSize: number,
  brand: string,
  maxBarW: number,
  eyebrow: string | null,
  theme: ResolvedInfographicTheme,
): string {
  const barW = Math.min(maxBarW, Math.max(80, title.length * fontSize * 0.42))
  const eyebrowColor = theme.palette.eyebrowColor
  const eyebrowSvg = eyebrow
    ? `<text x="${x}" y="${y - fontSize * 0.35}" font-family="Inter" font-size="${Math.max(11, Math.round(fontSize * 0.28))}" font-weight="800" fill="${eyebrowColor}" letter-spacing="0.14em">${escapeXml(eyebrow)}</text>`
    : ''
  return `
  ${eyebrowSvg}
  <text x="${x}" y="${y}" font-family="Inter" font-size="${Math.round(fontSize * 1.06)}" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">${escapeXml(title)}</text>
  <rect x="${x}" y="${y + 10}" width="${Math.round(barW)}" height="5" rx="2.5" fill="${brand}"/>`
}

export function listPanelSvg(
  x: number,
  y: number,
  w: number,
  h: number,
  brand: string,
  transparent: boolean,
  theme: ResolvedInfographicTheme,
): string {
  const opacity = transparent ? 0.55 : 1
  const p = theme.palette
  return `
  <defs>
    <linearGradient id="listPanelFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.panelTop}" stop-opacity="${0.82 * opacity}"/>
      <stop offset="100%" stop-color="${p.panelBottom}" stop-opacity="${0.48 * opacity}"/>
    </linearGradient>
    <linearGradient id="listPanelAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.panelAccent}" stop-opacity="0.65"/>
      <stop offset="35%" stop-color="${p.panelAccent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${p.panelAccent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#listPanelFill)" stroke="${p.panelAccent}" stroke-opacity="0.28" stroke-width="1"/>
  <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="url(#listPanelAccent)"/>`
}

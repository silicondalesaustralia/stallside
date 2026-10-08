import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'

export type CreativeDirection = {
  lead: string
  chips: string[]
}

const VISUAL_STYLE_CHIP: Record<InspirationGenerationHints['visualStyle'], string> = {
  photo_led: 'Photo-led',
  graphic_led: 'Graphic-led',
  mixed: 'Mixed photo + graphic',
}

function titleChip(raw: string, max = 28): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 3) return null
  const clipped = cleaned.length > max ? `${cleaned.slice(0, max - 1).trimEnd()}…` : cleaned
  return clipped.charAt(0).toUpperCase() + clipped.slice(1)
}

function pushUnique(chips: string[], value: string | null) {
  if (!value) return
  if (chips.some((c) => c.toLowerCase() === value.toLowerCase())) return
  chips.push(value)
}

/**
 * User-facing Creative Direction from existing analysis hints.
 * No extra model call - chips stay short and non-technical.
 */
export function buildCreativeDirection(hints: InspirationGenerationHints): CreativeDirection {
  const theme = hints.theme.themeSummary.trim()
  const tone = hints.theme.tone.trim().toLowerCase()
  const chips: string[] = []

  if (/\b(bold|urgent|direct|punchy|promotional)\b/.test(tone) || /\bbold|promotional\b/.test(theme.toLowerCase())) {
    pushUnique(chips, 'Bold promotional')
  }
  if (/\b(high contrast|contrast|dramatic)\b/.test(`${tone} ${theme.toLowerCase()}`)) {
    pushUnique(chips, 'High contrast')
  }
  pushUnique(chips, VISUAL_STYLE_CHIP[hints.visualStyle])
  if (hints.visualStyle === 'photo_led' || hints.visualStyle === 'mixed') {
    pushUnique(chips, 'Contained job photo')
  }
  if (
    (hints.headlineMaxChars > 0 && hints.headlineMaxChars <= 48) ||
    /\bheadline|hero|banner\b/.test(hints.layoutOrientation.toLowerCase())
  ) {
    pushUnique(chips, 'Strong headline')
  }
  const toneChip = titleChip(hints.theme.tone)
  if (toneChip && !/\b(bold|urgent|direct)\b/.test(tone)) {
    pushUnique(chips, toneChip)
  }
  const subjectChip = titleChip(hints.theme.subjectCategory)
  pushUnique(chips, subjectChip)

  const lead = theme
    ? theme.charAt(0).toUpperCase() + theme.slice(1)
    : 'A branded social ad with a clear promotional hierarchy.'

  return {
    lead: lead.length > 180 ? `${lead.slice(0, 179).trimEnd()}…` : lead,
    chips: chips.slice(0, 6),
  }
}

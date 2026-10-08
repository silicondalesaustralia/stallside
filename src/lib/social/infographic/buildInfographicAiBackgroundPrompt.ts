/**
 * Background-only prompts for hybrid infographic AI frames (Phase 0 spike + future prod).
 * Text/copy always composited via resvg - never in the image model prompt content.
 */

import type { InfographicPreset } from '@/lib/social/composeModel'
import {
  resolveInfographicTheme,
  type InfographicVisualThemeId,
  type ResolvedInfographicTheme,
} from '@/lib/social/infographic/infographicVisualTheme'
import { formatCanonicalTradeLabel } from '@/lib/social/canonicalTrades'

const BASE_SAFETY = [
  'Abstract premium social-media background frame only.',
  'Pure visual design artwork - absolutely no text, no numbers, no letters, no words, no logos, no watermarks, no UI mockups, no infographic copy.',
  'No blank lines, form fields, checklist boxes, checkmarks, bullet lists, or any UI chrome that could resemble readable content.',
  'Leave the centre calm and dark enough for a semi-transparent content panel and white text overlay.',
  'Square composition, polished agency-quality graphic design - not a photograph of a printed poster or screen.',
] as const

function themePromptFragment(theme: ResolvedInfographicTheme): string {
  const p = theme.palette
  switch (theme.id) {
    case 'seasonal_winter':
      return [
        'Winter seasonal palette:',
        `deep navy gradient (${p.bgTop} to ${p.bgBottom}),`,
        `soft ice-blue decorative accents (${p.panelAccent}, ${p.eyebrowColor}),`,
        'subtle abstract snowflake or frost shapes confined to corners and outer margins only - never in the central panel zone.',
        'Eyebrow mood: cold-weather readiness without rendering any words.',
      ].join(' ')
    default:
      return [
        'Default tradie brand palette:',
        `dark navy-charcoal gradient (${p.bgTop} to ${p.bgBottom}),`,
        'subtle warm brand-gold glow accents in outer frame edges only,',
        'minimal abstract geometric decoration in margins - central zone kept smooth and uncluttered.',
      ].join(' ')
  }
}

function presetLayoutFragment(preset: InfographicPreset): string {
  switch (preset) {
    case 'checklist':
      return [
        'Checklist layout frame:',
        'clean rounded central content zone occupying the middle ~60% of the canvas height,',
        'decorative border treatment in outer margins only; vertical list-friendly composition.',
        'Do not draw empty rows, tick boxes, lines for bullets, or placeholder list slots - only abstract margin decoration.',
      ].join(' ')
    case 'did_you_know':
      return [
        'Did-you-know educational poster frame:',
        'large upper hero zone for headline/stat overlay,',
        'bold decorative border with minimal clutter in the central panel area.',
      ].join(' ')
    case 'before_after_comparison':
      return [
        'Before/after comparison frame:',
        'two equal muted vertical zones (left and right columns) with a subtle centre divider motif,',
        'no column labels or words - just abstract split layout zones in the margins/background.',
      ].join(' ')
    case 'process_steps':
      return [
        'Process-steps flow frame:',
        'connected pathway or node motif in margins suggesting 2-4 steps,',
        'central corridor kept clear for a step list panel overlay.',
      ].join(' ')
  }
}

function tradeAtmosphereFragment(tradeId: string | null | undefined): string {
  const label = tradeId ? formatCanonicalTradeLabel(tradeId) : 'electrical'
  return [
    `Subtle ${label} trade atmosphere:`,
    'abstract equipment or energy motifs in frame edges only -',
    'no tools with readable labels, no switches with numbers, no gauges with digits.',
  ].join(' ')
}

export interface InfographicAiBackgroundPromptInput {
  preset: InfographicPreset
  visualTheme: InfographicVisualThemeId
  brandColor?: string | null
  tradeId?: string | null
}

export function buildInfographicAiBackgroundPrompt(
  input: InfographicAiBackgroundPromptInput,
): string {
  const brand = input.brandColor?.trim() || '#FFD100'
  const theme = resolveInfographicTheme({ visualTheme: input.visualTheme })

  const parts = [
    'Abstract premium infographic background frame for an Australian tradie social post.',
    presetLayoutFragment(input.preset),
    themePromptFragment(theme),
    tradeAtmosphereFragment(input.tradeId ?? 'electrical'),
    `Brand accent ${brand} as thin highlight lines or corner accents only - not large flat fills.`,
    ...BASE_SAFETY,
  ]

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

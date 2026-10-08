import { CAMPAIGN_FOCUS_MAX_CHARS } from '@/lib/social/normalizeCampaignFocus'
import type { RecreateMode } from '@/lib/social/recreateModes'

export type StructuredCampaignFocus = {
  raw: string
  focus: string[]
  keep: string[]
  remove: string[]
  change: string[]
  mustInclude: string[]
  mustNotInclude: string[]
}

export type CampaignFocusStarter = {
  id: string
  label: string
  insert: string
}

export const CAMPAIGN_FOCUS_STARTERS: CampaignFocusStarter[] = [
  { id: 'topic', label: 'Change the main topic', insert: 'Focus the post on: ' },
  { id: 'remove', label: 'Remove unwanted services', insert: 'Remove references to: ' },
  { id: 'offer', label: 'Change the offer', insert: 'Replace the original offer with: ' },
  {
    id: 'layout',
    label: 'Keep this layout',
    insert: 'Keep the same general layout and visual hierarchy, but ',
  },
  {
    id: 'person',
    label: 'Use a different type of person',
    insert: 'Use a different person who looks like: ',
  },
  {
    id: 'premium',
    label: 'More premium',
    insert: 'Make the design feel more premium, clean and professionally branded.',
  },
  {
    id: 'less-text',
    label: 'Less text',
    insert: 'Reduce the amount of text and make the key message more visually dominant.',
  },
]

const CLASSIFIERS: Array<{
  bucket: keyof Omit<StructuredCampaignFocus, 'raw'>
  re: RegExp
}> = [
  {
    bucket: 'focus',
    re: /^(?:please\s+)?focus(?:\s+(?:the\s+post|this|only))?(?:\s+this)?\s+on\s*[:.]?\s*/i,
  },
  {
    bucket: 'keep',
    re: /^(?:please\s+)?keep(?:\s+the)?\s+/i,
  },
  {
    bucket: 'remove',
    re: /^(?:please\s+)?(?:remove|drop|cut)(?:\s+references\s+to)?\s+/i,
  },
  {
    bucket: 'change',
    re: /^(?:please\s+)?(?:replace(?:\s+the)?|change|swap|make)\s+/i,
  },
  {
    bucket: 'mustInclude',
    re: /^(?:please\s+)?(?:must\s+include|include)\s+/i,
  },
  {
    bucket: 'mustNotInclude',
    re: /^(?:please\s+)?(?:must\s+not(?:\s+include)?|do\s+not|don't|dont)\s+(?:put|use|include|have)?\s*/i,
  },
]

function pushUnique(list: string[], value: string) {
  const cleaned = value.replace(/^[:.\s-]+/, '').replace(/[.]+$/, '').trim()
  if (cleaned.length < 2) return
  if (list.some((item) => item.toLowerCase() === cleaned.toLowerCase())) return
  list.push(cleaned)
}

function splitSentences(raw: string): string[] {
  return raw
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function structureCampaignFocus(raw: string): StructuredCampaignFocus {
  const structured: StructuredCampaignFocus = {
    raw: raw.trim(),
    focus: [],
    keep: [],
    remove: [],
    change: [],
    mustInclude: [],
    mustNotInclude: [],
  }

  for (const sentence of splitSentences(structured.raw)) {
    let matched = false
    for (const { bucket, re } of CLASSIFIERS) {
      if (!re.test(sentence)) continue
      const rest = sentence.replace(re, '').trim()
      pushUnique(structured[bucket], rest || sentence)
      matched = true
      break
    }
    if (!matched && /don't|do not|must not/i.test(sentence)) {
      pushUnique(structured.mustNotInclude, sentence)
    }
  }

  return structured
}

/** Append a chip starter. Never overwrites existing text. Never truncates. */
export function appendCampaignFocusStarter(
  current: string,
  starter: string,
  maxChars: number = CAMPAIGN_FOCUS_MAX_CHARS,
): string {
  const existing = current.replace(/\s+$/, '')
  const insert = starter.trimEnd()
  const joined = existing ? `${existing}\n${insert}` : insert
  if (joined.length > maxChars) return current
  return joined
}

function pushBucket(lines: string[], label: string, values: string[]) {
  if (values.length === 0) return
  lines.push(`${label}:`)
  for (const value of values) lines.push(`- ${value}`)
}

export function formatCampaignFocusPromptLines(
  raw: string,
  recreateMode: RecreateMode,
): string[] {
  const structured = structureCampaignFocus(raw)
  const lines = [
    'USER INSTRUCTIONS (highest creative priority after brand/compliance - honour in EVERY version):',
    'These override inferred Creative Direction, inspiration subject/theme, and generic service lists when they conflict.',
    'All 3 versions must stay on the requested subject. Diversity must come from layout, composition, crop, typography, hierarchy, worker pose, and scene - never from changing the requested topic.',
    recreateMode === 'closest'
      ? 'CLOSEST + USER INSTRUCTIONS: override subject and copy as asked, but keep more of the inspiration composition, layout, hierarchy, visual energy, and image/text balance.'
      : 'FRESH TAKE + USER INSTRUCTIONS: still honour every instruction. Composition, placement, and structure may change significantly.',
    'Full instructions:',
    structured.raw,
  ]

  const interpreted: string[] = []
  pushBucket(interpreted, 'FOCUS', structured.focus)
  pushBucket(interpreted, 'KEEP', structured.keep)
  pushBucket(interpreted, 'REMOVE', structured.remove)
  pushBucket(interpreted, 'CHANGE', structured.change)
  pushBucket(interpreted, 'MUST INCLUDE', structured.mustInclude)
  pushBucket(interpreted, 'MUST NOT INCLUDE', structured.mustNotInclude)
  if (interpreted.length > 0) {
    lines.push('Interpreted constraints (from the user - still honour the full instructions above):')
    lines.push(...interpreted)
  }

  lines.push(
    'If an offer appears in these instructions, you may use that offer. Do not use any offer from the inspiration screenshot.',
  )
  return lines
}

/** Inline SVG icon keys for infographic checklist rows (resvg-safe paths). */
export const INFOGRAPHIC_ICON_KEYS = [
  'check',
  'shield',
  'smoke_alarm',
  'heater',
  'blanket',
  'plug',
  'power_board',
  'extension',
  'outlet',
  'fan',
  'switchboard',
  'emergency',
  'bolt',
  'snowflake',
  'flame',
  'tool',
  'home',
  'star',
  'calendar',
  'water',
] as const

export type InfographicIconKey = (typeof INFOGRAPHIC_ICON_KEYS)[number]

/**
 * Distinct 24×24 stroke icons - shapes deliberately differ so small badges stay readable.
 * Multi-path icons use separate path elements (not compound strings) for clarity.
 */
const ICON_PATHS: Record<InfographicIconKey, string | string[]> = {
  check: 'M4 12.5 L9 17.5 L20 6.5',
  shield:
    'M12 3 L20 6.5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V6.5 Z M9 12 L11 14 L15.5 9.5',
  smoke_alarm: [
    'M12 4 C8 4 5 7 5 11 C5 14 7 16.5 9 18 V20 H15 V18 C17 16.5 19 14 19 11 C19 7 16 4 12 4 Z',
    'M12 2 V4 M6 5 L7.5 6.5 M18 5 L16.5 6.5',
  ],
  /** Radiator fins + heat wave - distinct from switchboard breakers */
  heater: [
    'M7 17 H17 V19 H7 Z',
    'M8 9 V17 M11 9 V17 M14 9 V17 M17 9 V17',
    'M8 7 Q12 4 16 7',
  ],
  /** Folded blanket - wavy top edge + stitch line */
  blanket: [
    'M4 13 Q7 10 10 13 Q13 16 16 13 Q19 10 20 13 V18 H4 Z',
    'M6 16 H18',
  ],
  /** Wall plug silhouette */
  plug: 'M9 3 V8 M15 3 V8 M8 8 H16 V14 C16 16 14.5 17.5 12 17.5 C9.5 17.5 8 16 8 14 Z M12 17.5 V21',
  /** Power board / strip - horizontal bar with 3 tall socket slots */
  power_board: [
    'M3 10 H21 V16 H3 Z',
    'M6.5 11.5 V14.5 M12 11.5 V14.5 M17.5 11.5 V14.5',
    'M3 16 V18 M21 16 V18',
  ],
  /** Daisy-chained extension - plug + coiled cord */
  extension: [
    'M14 4 V8 M16 4 V8 M13 8 H17 V12 H15 V14',
    'M8 14 C6 14 5 16 5 18 C5 20 7 21 9 20 C10 19 10 17 9 16',
    'M9 16 C11 15 13 16 14 18',
  ],
  /** Outdoor double power point on wall plate */
  outlet: [
    'M6 6 H18 V18 H6 Z',
    'M9 9 H11 V13 H9 Z M13 9 H15 V13 H13 Z',
    'M9 15 H15',
  ],
  /** Ceiling fan - hub + four blades */
  fan: [
    'M12 11 A1.5 1.5 0 1 0 12 14 A1.5 1.5 0 1 0 12 11',
    'M12 5 L12 8 M12 16 L12 19 M5 12 L8 12 M16 12 L19 12',
    'M7 7 L9.5 9.5 M16.5 16.5 L14 14 M16.5 7 L14 9.5 M7 17 L9.5 14.5',
  ],
  /** Breaker panel - three vertical switches */
  switchboard: [
    'M5 5 H19 V19 H5 Z',
    'M8 8 H10 V15 H8 Z M12 8 H14 V12 H12 Z M16 8 H18 V15 H16 Z',
  ],
  emergency: 'M12 4 L20 18 H4 Z M12 9 V13 M12 16 V16.5',
  bolt: 'M13 2 L6 13 H11 L10 22 L18 10 H13 Z',
  snowflake:
    'M12 3 V21 M5 7 L19 17 M19 7 L5 17 M3 12 H21 M6.5 5.5 L17.5 18.5 M17.5 5.5 L6.5 18.5',
  flame:
    'M12 3 C10 8 7 9 7 13 C7 16.5 9.5 19 12 19 C14.5 19 17 16.5 17 13 C17 9 14 8 12 3 Z',
  tool:
    'M14 4 L20 10 L17 13 L14 10 L10 14 L8 12 L12 8 L9 5 Z M6 18 L8 20',
  home: 'M4 11 L12 4 L20 11 V19 H4 Z M9 19 V13 H15 V19',
  star:
    'M12 4 L14.5 10 H21 L16 14 L18 20 L12 16.5 L6 20 L8 14 L3 10 H9.5 Z',
  calendar: 'M5 6 H19 V20 H5 Z M8 3 V7 M16 3 V7 M5 10 H19',
  water:
    'M12 3 C8 9 6 11.5 6 14.5 C6 17.5 8.5 20 12 20 C15.5 20 18 17.5 18 14.5 C18 11.5 16 9 12 3 Z',
}

export function isInfographicIconKey(value: string): value is InfographicIconKey {
  return (INFOGRAPHIC_ICON_KEYS as readonly string[]).includes(value)
}

function pathsForKey(key: InfographicIconKey): string[] {
  const raw = ICON_PATHS[key] ?? ICON_PATHS.check
  return Array.isArray(raw) ? raw : [raw]
}

/** Renders a stroked icon centred at (cx, cy). */
export function infographicIconSvg(
  key: InfographicIconKey,
  cx: number,
  cy: number,
  size: number,
  stroke: string,
  strokeWidth = 2.2,
): string {
  const scale = size / 24
  const paths = pathsForKey(key)
  const sw = strokeWidth / scale
  const pathEls = paths
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('')
  return `<g transform="translate(${cx - 12 * scale}, ${cy - 12 * scale}) scale(${scale})">${pathEls}</g>`
}

/** Keyword fallback when AI omits itemIcons - order matters (specific before generic). */
export function inferIconFromItemText(text: string, tradeId?: string | null): InfographicIconKey {
  const t = text.toLowerCase()
  if (/smoke|alarm/.test(t)) return 'smoke_alarm'
  if (/blanket/.test(t)) return 'blanket'
  if (/heater|radiator|heat(er)?\s/.test(t)) return 'heater'
  if (/overload|power board|boards with|board with/.test(t)) return 'power_board'
  if (/daisy|extension|chaining|chained/.test(t)) return 'extension'
  if (/outdoor|power point|weather damage/.test(t)) return 'outlet'
  if (/fan|ceiling/.test(t)) return 'fan'
  if (/surge|storm|lightning/.test(t)) return 'bolt'
  if (/switchboard|inspection|licensed|electrician/.test(t)) return 'switchboard'
  if (/emergency|main switch/.test(t)) return 'emergency'
  if (/winter|cold|snow/.test(t)) return 'snowflake'
  if (/water|leak|plumb|tap/.test(t)) return 'water'
  if (/fire|flame|gas/.test(t)) return 'flame'
  if (/safe|protect|shield/.test(t)) return 'shield'
  if (/book|schedule|appointment|christmas|call/.test(t)) return 'calendar'
  if (/home|house|property|air-con|aircon/.test(t)) return 'home'
  if (/cord|frayed|appliance|plug/.test(t)) return 'plug'
  if (tradeId === 'electrical') return 'bolt'
  if (tradeId === 'plumbing') return 'water'
  if (tradeId === 'hvac') return 'flame'
  return 'check'
}

export function resolveItemIcons(
  items: string[],
  explicit: string[] | null | undefined,
  tradeId?: string | null,
): InfographicIconKey[] {
  const resolved: InfographicIconKey[] = []
  const used = new Set<InfographicIconKey>()

  for (let i = 0; i < items.length; i++) {
    const raw = explicit?.[i]
    let pick: InfographicIconKey

    if (raw && isInfographicIconKey(raw)) {
      pick = raw
    } else {
      pick = inferIconFromItemText(items[i], tradeId)
    }

    // Avoid duplicate icons in one list - pick next-best inferred alternative
    if (used.has(pick)) {
      const fallback = inferIconFromItemText(
        `${items[i]} ${i}`,
        tradeId,
      )
      pick = used.has(fallback) ? pick : fallback
    }
    used.add(pick)
    resolved.push(pick)
  }
  return resolved
}

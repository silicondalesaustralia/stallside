/** Scene overlay stack placement - stored on businesses.social_text_styles. */

export const SCENE_STACK_ANCHORS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

export type SceneStackAnchor = (typeof SCENE_STACK_ANCHORS)[number]

export interface SceneStackLayout {
  stackAnchor: SceneStackAnchor
  /** Percent of canvas width, −20…20. Positive is right. */
  stackOffsetX: number
  /** Percent of canvas height, −20…20. Positive is down. */
  stackOffsetY: number
}

export const DEFAULT_SCENE_STACK_LAYOUT: SceneStackLayout = {
  stackAnchor: 'bottom-left',
  stackOffsetX: 0,
  stackOffsetY: 0,
}

export const SCENE_STACK_OFFSET_MIN = -20
export const SCENE_STACK_OFFSET_MAX = 20

export const SCENE_STACK_ANCHOR_LABELS: Record<SceneStackAnchor, string> = {
  'top-left': 'Top left',
  'top-center': 'Top centre',
  'top-right': 'Top right',
  'bottom-left': 'Bottom left',
  'bottom-center': 'Bottom centre',
  'bottom-right': 'Bottom right',
}

const ANCHOR_SET = new Set<string>(SCENE_STACK_ANCHORS)

export function isSceneStackAnchor(value: string): value is SceneStackAnchor {
  return ANCHOR_SET.has(value)
}

export function clampStackOffset(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0
  if (!Number.isFinite(n)) return 0
  return Math.min(SCENE_STACK_OFFSET_MAX, Math.max(SCENE_STACK_OFFSET_MIN, Math.round(n)))
}

export function parseSceneStackAnchor(value: unknown): SceneStackAnchor {
  if (typeof value === 'string' && isSceneStackAnchor(value)) return value
  return DEFAULT_SCENE_STACK_LAYOUT.stackAnchor
}

export function parseSceneStackLayout(raw: unknown): SceneStackLayout {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SCENE_STACK_LAYOUT }
  const obj = raw as {
    stackAnchor?: unknown
    stackOffsetX?: unknown
    stackOffsetY?: unknown
  }
  return {
    stackAnchor: parseSceneStackAnchor(obj.stackAnchor),
    stackOffsetX: 'stackOffsetX' in obj ? clampStackOffset(obj.stackOffsetX) : 0,
    stackOffsetY: 'stackOffsetY' in obj ? clampStackOffset(obj.stackOffsetY) : 0,
  }
}

export function stackLayoutFromStyles(styles: SceneStackLayout): SceneStackLayout {
  return {
    stackAnchor: parseSceneStackAnchor(styles.stackAnchor),
    stackOffsetX: clampStackOffset(styles.stackOffsetX),
    stackOffsetY: clampStackOffset(styles.stackOffsetY),
  }
}

export function stackVertical(anchor: SceneStackAnchor): 'top' | 'bottom' {
  return anchor.startsWith('top-') ? 'top' : 'bottom'
}

export function stackHorizontal(anchor: SceneStackAnchor): 'left' | 'center' | 'right' {
  if (anchor.endsWith('-left')) return 'left'
  if (anchor.endsWith('-right')) return 'right'
  return 'center'
}

export function sceneStackLayoutsEquivalent(a: SceneStackLayout, b: SceneStackLayout): boolean {
  return (
    a.stackAnchor === b.stackAnchor &&
    a.stackOffsetX === b.stackOffsetX &&
    a.stackOffsetY === b.stackOffsetY
  )
}

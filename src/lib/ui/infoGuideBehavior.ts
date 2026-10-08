export type InfoGuideOpenReason = 'none' | 'hover' | 'press'

export type InfoGuideEvent = 'hover-enter' | 'hover-leave' | 'press' | 'escape' | 'outside'

/** Hover preview only on devices that can hover with a fine pointer - never on touch. */
export function hoverPreviewAllowed(canHoverFinePointer: boolean): boolean {
  return canHoverFinePointer
}

export function nextInfoGuideState(
  current: InfoGuideOpenReason,
  event: InfoGuideEvent,
  hoverAllowed: boolean,
): InfoGuideOpenReason {
  if (event === 'escape' || event === 'outside') return 'none'

  if (event === 'press') {
    return current === 'press' ? 'none' : 'press'
  }

  if (!hoverAllowed) return current

  if (event === 'hover-enter') {
    return current === 'none' ? 'hover' : current
  }

  if (event === 'hover-leave') {
    return current === 'hover' ? 'none' : current
  }

  return current
}

export function computePopoverPlacement(input: {
  trigger: { top: number; left: number; right: number; bottom: number; width: number; height: number }
  viewportWidth: number
  viewportHeight: number
  popoverWidth: number
  popoverHeight: number
  gap?: number
  padding?: number
}): { top: number; left: number; maxWidth: number } {
  const gap = input.gap ?? 8
  const padding = input.padding ?? 8
  const maxWidth = Math.min(input.popoverWidth, Math.max(160, input.viewportWidth - padding * 2))
  const height = input.popoverHeight
  const spaceBelow = input.viewportHeight - input.trigger.bottom - gap - padding
  const placeBelow = spaceBelow >= height || input.trigger.top < height + gap + padding
  const top = placeBelow
    ? Math.min(input.trigger.bottom + gap, input.viewportHeight - height - padding)
    : Math.max(padding, input.trigger.top - height - gap)
  const preferredLeft = input.trigger.left + input.trigger.width / 2 - maxWidth / 2
  const left = Math.min(
    Math.max(padding, preferredLeft),
    Math.max(padding, input.viewportWidth - maxWidth - padding),
  )
  return {
    top: Math.max(padding, top),
    left,
    maxWidth,
  }
}

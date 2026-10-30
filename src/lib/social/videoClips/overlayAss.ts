import { videoHeadlineFontLabel } from '../videoBranding/videoHeadlineFontCatalog'
import type { TextOverlay } from './textOverlays'

type Tag = (seconds: number) => string

const STYLE_FIELDS = '&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0'

/** BorderStyle 1 (outline/shadow) and 3 (opaque box) bases; each line overrides font/size/colours. */
export function overlayStyleLines(): string[] {
  return [
    `Style: OverlayLine,Inter,48,${STYLE_FIELDS},1,0,0,5,10,10,10,1`,
    `Style: OverlayBox,Inter,48,${STYLE_FIELDS},3,0,0,5,10,10,10,1`,
  ]
}

function toAssColor(hex: string): string {
  const clean = hex.replace('#', '')
  return `&H${clean.slice(4, 6)}${clean.slice(2, 4)}${clean.slice(0, 2)}&`.toUpperCase()
}

export function overlayEvents(input: {
  overlays: TextOverlay[]
  width: number
  height: number
  assTime: Tag
}): string[] {
  const minDim = Math.min(input.width, input.height)
  return input.overlays.map((o) => {
    const fs = Math.max(8, Math.round((o.size / 100) * minDim))
    const x = Math.round(o.x * input.width)
    const y = Math.round(o.y * input.height)
    const box = o.style === 'box'
    const bord = box ? Math.round(fs * 0.25) : o.style === 'outline' ? Math.max(2, Math.round(fs * 0.08)) : 0
    const shad = o.style === 'plain' ? Math.max(1, Math.round(fs * 0.05)) : 0
    const tags = [
      '\\an5',
      `\\pos(${x},${y})`,
      `\\fn${videoHeadlineFontLabel(o.font)}`,
      `\\fs${fs}`,
      `\\b${o.bold ? 1 : 0}`,
      `\\c${toAssColor(o.color)}`,
      `\\3c${toAssColor(o.accent)}`,
      '\\4c&H000000&',
      `\\bord${bord}`,
      `\\shad${shad}`,
    ].join('')
    const text = o.text.replace(/[{}\\]/g, '').replace(/\s+/g, ' ').trim()
    const style = box ? 'OverlayBox' : 'OverlayLine'
    return `Dialogue: 1,${input.assTime(o.s)},${input.assTime(o.e)},${style},,0,0,0,,{${tags}}${text}`
  })
}

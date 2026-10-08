/** Relative luminance (0-1) using sRGB weights - matches existing isLightColor usage. */
export function relativeLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function relativeLuminanceFromHex(hex: string): number | null {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  return relativeLuminance(r, g, b)
}

/** True when a light background needs dark text (threshold aligned with project convention). */
export function isLightColor(hex: string): boolean {
  const lum = relativeLuminanceFromHex(hex)
  return lum !== null && lum > 0.62
}

export const SCENE_AUTO_DARK_TEXT = '#0A0A0A'
export const SCENE_AUTO_LIGHT_TEXT = '#FFFFFF'

/** Binary text on scrim-adjusted background: dark → light text, bright → dark text. */
export function pickSceneAutoTextColor(effectiveLuminance: number): string {
  return effectiveLuminance > 0.52 ? SCENE_AUTO_DARK_TEXT : SCENE_AUTO_LIGHT_TEXT
}

/** Black scrim composited over photo luminance. */
export function effectiveLuminanceOnBlackScrim(photoLuminance: number, scrimAlpha: number): number {
  const alpha = Math.min(1, Math.max(0, scrimAlpha))
  return photoLuminance * (1 - alpha)
}

/** Interpolate scrim opacity at Y within scrim rect (top→bottom gradient). */
export function scrimAlphaAtFraction(fractionFromScrimTop: number, midOpacity: number, bottomOpacity: number): number {
  const t = Math.min(1, Math.max(0, fractionFromScrimTop))
  if (t <= 0.35) {
    return (t / 0.35) * midOpacity
  }
  return midOpacity + ((t - 0.35) / 0.65) * (bottomOpacity - midOpacity)
}

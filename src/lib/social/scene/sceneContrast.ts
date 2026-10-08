/**
 * Scene photo contrast - sample hero-stack region, adapt scrim + auto text colors.
 */

import sharp from 'sharp'
import {
  effectiveLuminanceOnBlackScrim,
  pickSceneAutoTextColor,
  relativeLuminance,
  scrimAlphaAtFraction,
  SCENE_AUTO_DARK_TEXT,
  SCENE_AUTO_LIGHT_TEXT,
} from '@/lib/utils/colorContrast'
import type { InfographicPlatformId } from '@/lib/social/infographic/platformSizes'
import type { SceneLayout } from '@/lib/social/scene/sceneLayout'

export interface ScrimProfile {
  stopMidOpacity: number
  stopBottomOpacity: number
}

export const DEFAULT_SCRIM_PROFILE: ScrimProfile = {
  stopMidOpacity: 0.35,
  stopBottomOpacity: 0.82,
}

/** Target effective luminance under text (lower = darker scrim). */
const TARGET_EFFECTIVE_L = 0.28
const BUSY_STD_DEV_THRESHOLD = 0.18

export interface SceneContrastLog {
  platform: InfographicPlatformId
  sampleBox: { x: number; y: number; w: number; h: number }
  photoMeanL: number
  photoStdDev: number
  initialEffectiveL: number
  finalEffectiveL: number
  scrim: ScrimProfile
  autoHeadlineColor: string
  autoTaglineColor: string
}

export interface SceneContrastResult {
  scrim: ScrimProfile
  autoHeadlineColor: string
  autoTaglineColor: string
  log: SceneContrastLog
}

interface RegionStats {
  meanL: number
  stdDev: number
}

async function sampleRegionLuminance(
  photoBuffer: Buffer,
  box: { x: number; y: number; w: number; h: number },
): Promise<RegionStats> {
  const meta = await sharp(photoBuffer).metadata()
  const imgW = meta.width ?? 0
  const imgH = meta.height ?? 0
  if (imgW <= 0 || imgH <= 0) {
    return { meanL: 0.5, stdDev: 0.1 }
  }

  const left = clampInt(box.x, 0, imgW - 1)
  const top = clampInt(box.y, 0, imgH - 1)
  const width = clampInt(box.w, 1, imgW - left)
  const height = clampInt(box.h, 1, imgH - top)

  const { data, info } = await sharp(photoBuffer)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const channels = info.channels ?? 4
  const pixelCount = width * height
  if (pixelCount === 0) {
    return { meanL: 0.5, stdDev: 0.1 }
  }

  let sum = 0
  const luminances: number[] = []
  for (let i = 0; i < data.length; i += channels) {
    const lum = relativeLuminance(data[i], data[i + 1], data[i + 2])
    luminances.push(lum)
    sum += lum
  }
  const meanL = sum / luminances.length
  let variance = 0
  for (const lum of luminances) {
    variance += (lum - meanL) ** 2
  }
  const stdDev = Math.sqrt(variance / luminances.length)
  return { meanL, stdDev }
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function computeWeightedEffectiveL(
  layout: SceneLayout,
  photoMeanL: number,
  scrim: ScrimProfile,
): number {
  const { heroStackBox, scrimY, scrimH, scrimEdge } = layout
  const stackMidY = heroStackBox.y + heroStackBox.h / 2
  const fromScrimTop = scrimH > 0 ? (stackMidY - scrimY) / scrimH : 1
  const fraction = scrimEdge === 'top' ? 1 - fromScrimTop : fromScrimTop
  const alpha = scrimAlphaAtFraction(
    fraction,
    scrim.stopMidOpacity,
    scrim.stopBottomOpacity,
  )
  return effectiveLuminanceOnBlackScrim(photoMeanL, alpha)
}

function adaptScrimProfile(
  photoMeanL: number,
  photoStdDev: number,
  initialEffectiveL: number,
): ScrimProfile {
  let mid = DEFAULT_SCRIM_PROFILE.stopMidOpacity
  let bottom = DEFAULT_SCRIM_PROFILE.stopBottomOpacity

  const busy = photoStdDev > BUSY_STD_DEV_THRESHOLD
  const tooBright = initialEffectiveL > TARGET_EFFECTIVE_L || (busy && photoMeanL > 0.45)

  if (tooBright) {
    const overshoot = Math.min(1, (initialEffectiveL - TARGET_EFFECTIVE_L) / 0.35)
    const boost = 0.08 + overshoot * 0.12 + (busy ? 0.04 : 0)
    mid = Math.min(0.55, mid + boost * 0.6)
    bottom = Math.min(0.92, bottom + boost)
  } else if (initialEffectiveL < TARGET_EFFECTIVE_L - 0.12 && photoMeanL < 0.25) {
    const reduction = Math.min(0.15, (TARGET_EFFECTIVE_L - 0.12 - initialEffectiveL) * 0.5)
    mid = Math.max(0.2, mid - reduction * 0.5)
    bottom = Math.max(0.65, bottom - reduction)
  }

  return {
    stopMidOpacity: round3(mid),
    stopBottomOpacity: round3(bottom),
  }
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

export async function analyzeScenePhotoContrast(
  resizedPhotoBuffer: Buffer,
  layout: SceneLayout,
  platform: InfographicPlatformId,
): Promise<SceneContrastResult> {
  const { meanL: photoMeanL, stdDev: photoStdDev } = await sampleRegionLuminance(
    resizedPhotoBuffer,
    layout.heroStackBox,
  )

  const initialEffectiveL = computeWeightedEffectiveL(layout, photoMeanL, DEFAULT_SCRIM_PROFILE)

  const scrim = adaptScrimProfile(photoMeanL, photoStdDev, initialEffectiveL)
  const finalEffectiveL = computeWeightedEffectiveL(layout, photoMeanL, scrim)

  const autoText = pickSceneAutoTextColor(finalEffectiveL)

  const log: SceneContrastLog = {
    platform,
    sampleBox: layout.heroStackBox,
    photoMeanL: round3(photoMeanL),
    photoStdDev: round3(photoStdDev),
    initialEffectiveL: round3(initialEffectiveL),
    finalEffectiveL: round3(finalEffectiveL),
    scrim,
    autoHeadlineColor: autoText,
    autoTaglineColor: autoText,
  }

  return {
    scrim,
    autoHeadlineColor: autoText,
    autoTaglineColor: autoText,
    log,
  }
}

/** Opaque dark gradient - no sampling; auto colors default to light text. */
export function sceneOpaqueAutoColors(): {
  autoHeadlineColor: string
  autoTaglineColor: string
} {
  return {
    autoHeadlineColor: SCENE_AUTO_LIGHT_TEXT,
    autoTaglineColor: SCENE_AUTO_LIGHT_TEXT,
  }
}

export { SCENE_AUTO_DARK_TEXT, SCENE_AUTO_LIGHT_TEXT }

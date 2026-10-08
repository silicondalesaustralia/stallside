import type { VideoBrandingConfig } from '@/lib/social/videoBranding/types'
import { escapeFfmpegFilterPath } from '@/lib/social/videoBranding/overlayText'
import {
  drawtextBoxParams,
  drawtextXExpression,
  ffmpegFontColor,
  resolveHeadlinePlacement,
  resolveVideoHeadlineStyle,
  videoHeadlineFontSizePx,
  videoHeadlineLineHeight,
  type ResolvedVideoHeadlineStyle,
  type VideoHeadlineBusinessDefaults,
} from '@/lib/social/videoBranding/headlineStyle'
import { resolveVideoHeadlineFontPath } from '@/lib/social/videoBranding/videoHeadlineFonts'
import {
  VIDEO_LOGO_SIZE_WIDTH_RATIO,
  videoLogoOverlayCoords,
  videoSafeMarginPx,
  videoTextBoxY,
} from '@/lib/social/videoBranding/safeZones'
import type { VideoLogoPosition, VideoLogoSize, VideoTextPosition } from '@/lib/social/videoBranding/types'

/** libx264 speed preset - social V1 favours latency over compression efficiency. */
export const FFMPEG_VIDEO_PRESET = 'veryfast'
export const FFMPEG_VIDEO_CRF = '23'

export type FfmpegBrandingInput = {
  videoWidth: number
  videoHeight: number
  hasLogo: boolean
  logoWidth: number
  logoHeight: number
  logoPosition: VideoLogoPosition | null
  logoSize: VideoLogoSize | null
  headlineStyle: ResolvedVideoHeadlineStyle
  /** One UTF-8 textfile path per overlay line (already written to disk). */
  textFilePaths: string[]
}

export type FfmpegBrandingPlan = {
  filterComplex: string
  logoInputIndex: number | null
}

export function computeLogoDimensions(params: {
  videoWidth: number
  logoSourceWidth: number
  logoSourceHeight: number
  logoSize: VideoLogoSize
}): { width: number; height: number } {
  const ratio = VIDEO_LOGO_SIZE_WIDTH_RATIO[params.logoSize]
  const targetWidth = Math.max(1, Math.round(params.videoWidth * ratio))
  const aspect = params.logoSourceWidth / Math.max(1, params.logoSourceHeight)
  const width = Math.min(targetWidth, params.videoWidth)
  const height = Math.max(1, Math.round(width / aspect))
  return { width, height }
}

export function buildFfmpegBrandingPlan(input: FfmpegBrandingInput): FfmpegBrandingPlan {
  const { videoWidth, videoHeight } = input
  const filters: string[] = []
  let currentLabel = '0:v'
  let logoInputIndex: number | null = null

  if (input.hasLogo && input.logoPosition && input.logoWidth > 0 && input.logoHeight > 0) {
    logoInputIndex = 1
    const { x, y } = videoLogoOverlayCoords({
      videoWidth,
      videoHeight,
      logoWidth: input.logoWidth,
      logoHeight: input.logoHeight,
      position: input.logoPosition,
    })
    filters.push(
      `[1:v]scale=${input.logoWidth}:${input.logoHeight}:force_original_aspect_ratio=decrease[logo_scaled]`,
      `[${currentLabel}][logo_scaled]overlay=${x}:${y}:format=auto[v_logo]`,
    )
    currentLabel = 'v_logo'
  }

  const textPaths = input.textFilePaths.filter(Boolean)
  const style = input.headlineStyle
  const placement = resolveHeadlinePlacement({
    textPosition: style.textPosition,
    textAlign: style.align,
    logoPosition: input.logoPosition,
    hasLogo: input.hasLogo,
  })

  if (textPaths.length && placement.textPosition) {
    const fontSize = videoHeadlineFontSizePx(style.size, videoHeight)
    const lh = videoHeadlineLineHeight(fontSize)
    const blockHeight = lh * textPaths.length + Math.round(fontSize * 0.35)
    const boxY = videoTextBoxY({
      videoHeight,
      textBlockHeight: blockHeight,
      position: placement.textPosition,
      videoWidth,
    })
    const horizontalPad = videoSafeMarginPx(videoWidth, videoHeight)
    const xExpr = drawtextXExpression(placement.textAlign, horizontalPad)
    const fontPath = escapeFfmpegFilterPath(
      resolveVideoHeadlineFontPath(style.fontId, style.weight),
    )
    const fontColor = ffmpegFontColor(style.color)
    const box = drawtextBoxParams(style.background, style.color)

    textPaths.forEach((filePath, index) => {
      const escapedPath = escapeFfmpegFilterPath(filePath)
      const y = boxY + index * lh
      const outLabel = index === textPaths.length - 1 ? 'v_out' : `v_text_${index}`
      const boxParts = box.box
        ? `:box=1:boxcolor=${box.boxcolor}:boxborderw=${box.boxborderw}`
        : ''
      filters.push(
        `[${currentLabel}]drawtext=fontfile=${fontPath}:textfile=${escapedPath}:reload=0:fontsize=${fontSize}:fontcolor=${fontColor}:x=${xExpr}:y=${y}${boxParts}[${outLabel}]`,
      )
      currentLabel = outLabel
    })
  } else if (filters.length) {
    filters.push(`[${currentLabel}]null[v_out]`)
  }

  const filterComplex = filters.length > 0 ? filters.join(';') : 'null'

  return {
    filterComplex,
    logoInputIndex,
  }
}

export function buildFfmpegArgs(params: {
  inputVideoPath: string
  inputLogoPath: string | null
  outputPath: string
  plan: FfmpegBrandingPlan
  hasAudio: boolean
}): string[] {
  const args = ['-y', '-hide_banner', '-loglevel', 'error']

  args.push('-i', params.inputVideoPath)
  if (params.inputLogoPath) {
    args.push('-i', params.inputLogoPath)
  }

  if (params.plan.filterComplex && params.plan.filterComplex !== 'null') {
    args.push('-filter_complex', params.plan.filterComplex, '-map', '[v_out]')
  } else {
    args.push('-map', '0:v:0')
  }

  if (params.hasAudio) {
    args.push('-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k')
  }

  args.push(
    '-c:v',
    'libx264',
    '-preset',
    FFMPEG_VIDEO_PRESET,
    '-crf',
    FFMPEG_VIDEO_CRF,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    params.outputPath,
  )

  return args
}

export function brandingConfigHasWork(config: VideoBrandingConfig): boolean {
  return config.logoChoice !== 'none' || Boolean(config.overlayText?.trim())
}

export function resolveHeadlineStyleForRender(
  config: Partial<VideoBrandingConfig>,
  business?: VideoHeadlineBusinessDefaults,
): ResolvedVideoHeadlineStyle {
  return resolveVideoHeadlineStyle(config, business)
}

// Re-export for callers that imported VideoTextPosition from here historically.
export type { VideoTextPosition }

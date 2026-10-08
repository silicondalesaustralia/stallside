import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import {
  buildFfmpegArgs,
  buildFfmpegBrandingPlan,
  computeLogoDimensions,
} from '@/lib/social/videoBranding/ffmpegPlan'
import { runFfmpeg, runProcessCapture } from '@/lib/social/videoBranding/runFfmpeg'
import { writeOverlayTextFiles } from '@/lib/social/videoBranding/writeOverlayTextFiles'
import {
  ffprobeLogoArgs,
  ffprobeVideoArgs,
  parseFfprobeVideoJson,
} from '@/lib/social/videoBranding/videoProbe'
import {
  resolveVideoHeadlineStyle,
  videoHeadlineFontSizePx,
} from '@/lib/social/videoBranding/headlineStyle'
import type { VideoBrandingConfig } from '@/lib/social/videoBranding/types'
import type {
  VideoLogoPosition,
  VideoLogoSize,
  VideoTextPosition,
} from '@/lib/social/videoBranding/types'

export type LocalBrandingInput = {
  inputVideoPath: string
  inputLogoPath?: string | null
  overlayText?: string | null
  logoPosition?: VideoLogoPosition | null
  logoSize?: VideoLogoSize | null
  textPosition?: VideoTextPosition | null
  brandingConfig?: Partial<VideoBrandingConfig> | null
  outputPath?: string
  timeoutMs?: number
}

export type LocalBrandingResult = {
  outputPath: string
  displayWidth: number
  displayHeight: number
  hasAudio: boolean
}

export async function probeLogoDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const out = await runProcessCapture('ffprobe', ffprobeLogoArgs(filePath))
  const parsed = JSON.parse(out) as { streams?: Array<{ width?: number; height?: number }> }
  return {
    width: parsed.streams?.[0]?.width ?? 1,
    height: parsed.streams?.[0]?.height ?? 1,
  }
}

export async function probeVideoDisplay(filePath: string) {
  const out = await runProcessCapture('ffprobe', ffprobeVideoArgs(filePath))
  return parseFfprobeVideoJson(out)
}

/** Run FFmpeg branding on local files (integration tests + worker). */
export async function processBrandingLocally(
  input: LocalBrandingInput,
): Promise<LocalBrandingResult> {
  const probe = await probeVideoDisplay(input.inputVideoPath)
  if (probe.displayWidth <= 0 || probe.displayHeight <= 0) {
    throw new Error('invalid_video_dimensions')
  }

  const hasLogo = Boolean(input.inputLogoPath?.trim())
  let logoWidth = 0
  let logoHeight = 0

  if (hasLogo && input.inputLogoPath) {
    const logoProbe = await probeLogoDimensions(input.inputLogoPath)
    const dims = computeLogoDimensions({
      videoWidth: probe.displayWidth,
      logoSourceWidth: logoProbe.width,
      logoSourceHeight: logoProbe.height,
      logoSize: input.logoSize ?? 'medium',
    })
    logoWidth = dims.width
    logoHeight = dims.height
  }

  const workDir = join(tmpdir(), `su-brand-local-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })

  try {
    const headlineStyle = resolveVideoHeadlineStyle(
      {
        overlayText: input.overlayText,
        textPosition: input.textPosition ?? 'bottom',
        ...input.brandingConfig,
      },
      undefined,
    )
    const fontSize = videoHeadlineFontSizePx(headlineStyle.size, probe.displayHeight)
    const textFilePaths = await writeOverlayTextFiles(workDir, input.overlayText, {
      videoWidth: probe.displayWidth,
      fontSize,
      align: headlineStyle.align,
    })

    const plan = buildFfmpegBrandingPlan({
      videoWidth: probe.displayWidth,
      videoHeight: probe.displayHeight,
      hasLogo,
      logoWidth,
      logoHeight,
      logoPosition: input.logoPosition ?? null,
      logoSize: input.logoSize ?? null,
      headlineStyle,
      textFilePaths,
    })

    const outputPath = input.outputPath ?? join(workDir, 'output.mp4')
    const ffmpegArgs = buildFfmpegArgs({
      inputVideoPath: input.inputVideoPath,
      inputLogoPath: hasLogo ? input.inputLogoPath! : null,
      outputPath,
      plan,
      hasAudio: probe.hasAudio,
    })

    await runFfmpeg(ffmpegArgs, input.timeoutMs)

    return {
      outputPath,
      displayWidth: probe.displayWidth,
      displayHeight: probe.displayHeight,
      hasAudio: probe.hasAudio,
    }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

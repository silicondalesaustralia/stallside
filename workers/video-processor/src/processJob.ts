import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildFfmpegArgs,
  buildFfmpegBrandingPlan,
  computeLogoDimensions,
  FFMPEG_VIDEO_CRF,
  FFMPEG_VIDEO_PRESET,
} from '../../../lib/social/videoBranding/ffmpegPlan'
import type { VideoProcessingJobRow } from '../../../lib/social/videoBranding/types'
import { resolveLogoChoiceForWorker, requireProcessedPublicUrl } from '../../../lib/social/videoBranding/createProcessingJob'
import { markBrandingJobFailed } from '../../../lib/social/videoBranding/jobFailure'
import {
  probeLogoDimensions,
  probeVideoDisplay,
} from '../../../lib/social/videoBranding/processBrandingLocally'
import { runFfmpeg, FfmpegTimeoutError } from '../../../lib/social/videoBranding/runFfmpeg'
import { VideoBrandingJobTimer } from '../../../lib/social/videoBranding/processJobTiming'
import { writeOverlayTextFiles } from '../../../lib/social/videoBranding/writeOverlayTextFiles'
import { brandingConfigFromJson } from '../../../lib/social/videoBranding/validation'
import {
  mergeBrandingConfigWithDefaults,
  resolveVideoHeadlineStyle,
  videoHeadlineFontSizePx,
} from '../../../lib/social/videoBranding/headlineStyle'
import type { VideoBrandingConfig } from '../../../lib/social/videoBranding/types'
import { BUSINESS_ASSETS_BUCKET, SOCIAL_VIDEO_BUCKET } from './supabase'
import { removeStoragePaths } from '../../../lib/social/mediaAssetStorage'
import { writeFile } from 'node:fs/promises'

async function downloadStorageObject(
  db: SupabaseClient,
  bucket: string,
  path: string,
  destPath: string,
): Promise<number> {
  const { data, error } = await db.storage.from(bucket).download(path)
  if (error || !data) throw new Error(`download failed: ${error?.message || bucket}/${path}`)
  const buf = Buffer.from(await data.arrayBuffer())
  await writeFile(destPath, buf)
  return buf.length
}

async function uploadProcessedVideo(
  db: SupabaseClient,
  path: string,
  filePath: string,
): Promise<number> {
  const body = await readFile(filePath)
  const { error } = await db.storage.from(SOCIAL_VIDEO_BUCKET).upload(path, body, {
    contentType: 'video/mp4',
    upsert: false,
  })
  if (error) throw new Error(`upload failed: ${error.message}`)
  return body.length
}

export async function processVideoJob(
  db: SupabaseClient,
  job: VideoProcessingJobRow,
  workerId: string,
): Promise<void> {
  const timer = new VideoBrandingJobTimer(job.id, job.asset_id)
  timer.log('job claimed', { workerId })

  const workDir = join(tmpdir(), `su-video-${randomUUID()}`)
  await mkdir(workDir, { recursive: true })
  let uploadedOutputPath: string | null = null

  try {
    timer.beginStage('asset_fetch')
    const { data: asset, error: assetErr } = await db
      .from('social_media_assets')
      .select('id, business_id, storage_path, mime_type, branding_config')
      .eq('id', job.asset_id)
      .single()

    if (assetErr || !asset?.storage_path) {
      throw new Error('asset_missing')
    }

    const { data: business } = await db
      .from('businesses')
      .select('logo_url')
      .eq('id', job.business_id)
      .maybeSingle()

    const ext = asset.mime_type === 'video/quicktime' ? 'mov' : 'mp4'
    const inputPath = join(workDir, `input.${ext}`)

    timer.beginStage('original_download')
    const originalBytes = await downloadStorageObject(
      db,
      SOCIAL_VIDEO_BUCKET,
      asset.storage_path,
      inputPath,
    )
    timer.log('original downloaded', { bytes: originalBytes })

    timer.beginStage('ffprobe')
    const probe = await probeVideoDisplay(inputPath)
    if (probe.displayWidth <= 0 || probe.displayHeight <= 0) {
      throw new Error('invalid_video_dimensions')
    }
    timer.log('ffprobe complete', {
      width: probe.displayWidth,
      height: probe.displayHeight,
      fps: probe.fps,
      hasAudio: probe.hasAudio,
      rotation: probe.rotation,
    })

    let logoPath: string | null = null
    let logoWidth = 0
    let logoHeight = 0
    const hasLogo = job.logo_choice !== 'none'

    if (hasLogo) {
      timer.beginStage('logo_download')
      const logoResolved = await resolveLogoChoiceForWorker(
        db,
        job.business_id,
        job,
        business?.logo_url,
      )
      let logoBytes = 0
      if (logoResolved.storagePath) {
        logoPath = join(workDir, 'logo.webp')
        logoBytes = await downloadStorageObject(
          db,
          BUSINESS_ASSETS_BUCKET,
          logoResolved.storagePath,
          logoPath,
        )
      } else if (logoResolved.fetchUrl) {
        const res = await fetch(logoResolved.fetchUrl)
        if (!res.ok) throw new Error('logo_fetch_failed')
        logoPath = join(workDir, 'logo.webp')
        const buf = Buffer.from(await res.arrayBuffer())
        await writeFile(logoPath, buf)
        logoBytes = buf.length
      } else {
        throw new Error('logo_unavailable')
      }
      timer.log('logo downloaded', { bytes: logoBytes })

      const logoProbe = await probeLogoDimensions(logoPath)
      const dims = computeLogoDimensions({
        videoWidth: probe.displayWidth,
        logoSourceWidth: logoProbe.width,
        logoSourceHeight: logoProbe.height,
        logoSize: job.logo_size ?? 'medium',
      })
      logoWidth = dims.width
      logoHeight = dims.height
    }

    const storedConfig =
      brandingConfigFromJson(asset.branding_config as Record<string, unknown> | null) ??
      ({
        logoChoice: job.logo_choice,
        logoAssetId: job.logo_asset_id,
        logoPosition: job.logo_position,
        logoSize: job.logo_size,
        overlayText: job.overlay_text,
        textPosition: job.text_position,
      } satisfies VideoBrandingConfig)

    const brandingConfig: VideoBrandingConfig = mergeBrandingConfigWithDefaults(storedConfig)
    const headlineStyle = resolveVideoHeadlineStyle(brandingConfig)
    const headlineFontSize = videoHeadlineFontSizePx(headlineStyle.size, probe.displayHeight)

    const textFilePaths = await writeOverlayTextFiles(workDir, job.overlay_text, {
      videoWidth: probe.displayWidth,
      fontSize: headlineFontSize,
      align: headlineStyle.align,
    })

    const plan = buildFfmpegBrandingPlan({
      videoWidth: probe.displayWidth,
      videoHeight: probe.displayHeight,
      hasLogo,
      logoWidth,
      logoHeight,
      logoPosition: job.logo_position,
      logoSize: job.logo_size,
      headlineStyle,
      textFilePaths,
    })

    const outputPath = join(workDir, 'output.mp4')
    const ffmpegArgs = buildFfmpegArgs({
      inputVideoPath: inputPath,
      inputLogoPath: logoPath,
      outputPath,
      plan,
      hasAudio: probe.hasAudio,
    })

    timer.beginStage('ffmpeg')
    timer.log('ffmpeg start', { preset: FFMPEG_VIDEO_PRESET, crf: FFMPEG_VIDEO_CRF })
    await runFfmpeg(ffmpegArgs)
    const outputBytes = (await stat(outputPath)).size
    timer.log('ffmpeg complete', { bytes: outputBytes, preset: FFMPEG_VIDEO_PRESET, crf: FFMPEG_VIDEO_CRF })

    timer.beginStage('upload')
    const uploadedBytes = await uploadProcessedVideo(db, job.output_storage_path, outputPath)
    uploadedOutputPath = job.output_storage_path
    timer.log('upload complete', { bytes: uploadedBytes })

    const processedUrl = requireProcessedPublicUrl(job.output_storage_path, db)
    const now = new Date().toISOString()

    timer.beginStage('asset_update')
    const { error: assetUpdateErr } = await db
      .from('social_media_assets')
      .update({
        processed_url: processedUrl,
        processed_storage_path: job.output_storage_path,
        processing_status: 'processed',
        branding_config: brandingConfig,
        updated_at: now,
      })
      .eq('id', job.asset_id)

    if (assetUpdateErr) {
      console.error('[VideoBranding] asset update failed after upload', {
        jobId: job.id,
        assetId: job.asset_id,
        error: assetUpdateErr.message,
      })
      throw new Error(assetUpdateErr.message)
    }
    timer.log('asset update complete')

    if (job.previous_processed_path && job.previous_processed_path !== job.output_storage_path) {
      await removeStoragePaths(db, [job.previous_processed_path])
    }

    timer.beginStage('job_complete')
    const { error: jobCompleteErr } = await db
      .from('social_video_processing_jobs')
      .update({
        status: 'completed',
        completed_at: now,
        updated_at: now,
        error_code: null,
        error_message: null,
      })
      .eq('id', job.id)

    if (jobCompleteErr) {
      console.warn('[VideoBranding] job completed update failed (asset already processed)', {
        jobId: job.id,
        error: jobCompleteErr.message,
      })
    }

    timer.log('job complete')
  } catch (err) {
    timer.logFailure(err)

    const errorCode =
      err instanceof FfmpegTimeoutError
        ? 'worker_timeout'
        : err instanceof Error
          ? err.message.slice(0, 80)
          : 'processing_failed'
    const errorMessage = err instanceof Error ? err.message : 'processing_failed'

    if (uploadedOutputPath) {
      console.error('[VideoBranding] orphan processed upload after failure', {
        jobId: job.id,
        assetId: job.asset_id,
        path: uploadedOutputPath,
      })
    }

    await markBrandingJobFailed(db, {
      jobId: job.id,
      assetId: job.asset_id,
      errorCode,
      errorMessage,
      forceProcessingFailed: err instanceof FfmpegTimeoutError,
    })

    throw err
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

export async function claimNextJob(
  db: SupabaseClient,
  workerId: string,
): Promise<VideoProcessingJobRow | null> {
  const { data: pending, error } = await db
    .from('social_video_processing_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !pending) return null

  const now = new Date().toISOString()
  const { data: claimed, error: claimErr } = await db
    .from('social_video_processing_jobs')
    .update({
      status: 'processing',
      claimed_at: now,
      worker_id: workerId,
      updated_at: now,
    })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle()

  if (claimErr || !claimed) return null
  return claimed as VideoProcessingJobRow
}

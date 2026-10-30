import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createWorkerSupabase } from './supabase'
import { claimNextJob, processVideoJob } from './processJob'
import { recoverStaleProcessingJobs } from '../../../src/lib/social/videoBranding/staleJobRecovery'
import { recoverStaleClipJobs, requeueInterruptedClipJobs } from './staleClipJobRecovery'
import { claimNextClipJob } from './clipJobQueue'
import { processClipJob } from './processClipJob'
import { isR2Configured } from '../../../src/lib/social/videoClips/r2'
import { claimNextCaptionJob, processCaptionJob } from './captionJob'
import { recoverStaleCaptionJobs, requeueInterruptedCaptionJobs } from './captionJobRecovery'

const POLL_MS = Number(process.env.VIDEO_PROCESSOR_POLL_MS || 3000)
const WORKER_ID = process.env.VIDEO_PROCESSOR_WORKER_ID || `render-${randomUUID().slice(0, 8)}`
const RECOVER_EVERY_POLLS = 20

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/** Runs every queued editor save; returns true if any ran. */
async function drainQuickJobs(db: SupabaseClient): Promise<boolean> {
  let ran = false
  for (let job = await claimNextCaptionJob(db, WORKER_ID); job; job = await claimNextCaptionJob(db, WORKER_ID)) {
    console.log('[VideoProcessor] processing caption job', job.id, job.asset_id)
    await processCaptionJob(db, job)
    ran = true
  }
  return ran
}

async function main() {
  console.log('[VideoProcessor] starting', { workerId: WORKER_ID, pollMs: POLL_MS })
  const db = createWorkerSupabase()

  const startupRecovered =
    (await requeueInterruptedClipJobs(db, WORKER_ID)) +
    (await requeueInterruptedCaptionJobs(db, WORKER_ID)) +
    (await recoverStaleProcessingJobs(db)) +
    (await recoverStaleClipJobs(db)) +
    (await recoverStaleCaptionJobs(db))
  if (startupRecovered > 0) {
    console.log('[VideoProcessor] recovered stale jobs on startup', startupRecovered)
  }

  const canClipVideos = isR2Configured()
  if (!canClipVideos) {
    console.warn('[VideoProcessor] R2 env vars missing — not claiming clip jobs on this worker')
  }

  let pollsSinceRecovery = 0

  while (true) {
    try {
      if (++pollsSinceRecovery >= RECOVER_EVERY_POLLS) {
        const recovered =
          (await recoverStaleProcessingJobs(db)) +
          (await recoverStaleClipJobs(db)) +
          (await recoverStaleCaptionJobs(db))
        if (recovered > 0) {
          console.log('[VideoProcessor] recovered stale jobs', recovered)
        }
        pollsSinceRecovery = 0
      }

      const job = await claimNextJob(db, WORKER_ID)
      if (job) {
        console.log('[VideoProcessor] processing job', job.id, job.asset_id)
        await processVideoJob(db, job, WORKER_ID)
        console.log('[VideoProcessor] completed job', job.id)
        continue
      }

      // Clip editor jobs only run on workers set up for video clips (R2), so a stray or
      // under-provisioned worker can't claim them and stall them.
      if (!canClipVideos) {
        await sleep(POLL_MS)
        continue
      }
      if (await drainQuickJobs(db)) continue
      const clipJob = await claimNextClipJob(db, WORKER_ID)
      if (!clipJob) {
        await sleep(POLL_MS)
        continue
      }

      console.log('[VideoProcessor] processing clip job', clipJob.id, clipJob.source_id)
      await processClipJob(db, clipJob, async () => {
        await drainQuickJobs(db)
      })
      console.log('[VideoProcessor] completed clip job', clipJob.id)
    } catch (err) {
      console.error(
        '[VideoProcessor] job failed',
        err instanceof Error ? err.message : err,
      )
      await sleep(POLL_MS)
    }
  }
}

main().catch((err) => {
  console.error('[VideoProcessor] fatal', err)
  process.exit(1)
})

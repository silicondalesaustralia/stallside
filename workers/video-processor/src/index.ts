import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { createWorkerSupabase } from './supabase'
import { claimNextJob, processVideoJob } from './processJob'
import { recoverStaleProcessingJobs } from '../../../lib/social/videoBranding/staleJobRecovery'

const POLL_MS = Number(process.env.VIDEO_PROCESSOR_POLL_MS || 3000)
const WORKER_ID = process.env.VIDEO_PROCESSOR_WORKER_ID || `render-${randomUUID().slice(0, 8)}`
const RECOVER_EVERY_POLLS = 20

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('[VideoProcessor] starting', { workerId: WORKER_ID, pollMs: POLL_MS })
  const db = createWorkerSupabase()

  const startupRecovered = await recoverStaleProcessingJobs(db)
  if (startupRecovered > 0) {
    console.log('[VideoProcessor] recovered stale jobs on startup', startupRecovered)
  }

  let pollsSinceRecovery = 0

  while (true) {
    try {
      if (++pollsSinceRecovery >= RECOVER_EVERY_POLLS) {
        const recovered = await recoverStaleProcessingJobs(db)
        if (recovered > 0) {
          console.log('[VideoProcessor] recovered stale jobs', recovered)
        }
        pollsSinceRecovery = 0
      }

      const job = await claimNextJob(db, WORKER_ID)
      if (!job) {
        await sleep(POLL_MS)
        continue
      }

      console.log('[VideoProcessor] processing job', job.id, job.asset_id)
      await processVideoJob(db, job, WORKER_ID)
      console.log('[VideoProcessor] completed job', job.id)
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

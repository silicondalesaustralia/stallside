import { createWriteStream } from 'node:fs'
import { open } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { headR2Object, presignR2Url } from '../../../src/lib/social/videoClips/r2'

/**
 * Single R2 connections from Railway run at ~1 MB/s, so a 270 MB source took 5–10 minutes.
 * Fetch byte ranges in parallel, streaming each straight to its offset (no large buffers).
 */
const RANGE_BYTES = 8 * 1024 * 1024
const PARALLEL_RANGES = 6
const RANGE_ATTEMPTS = 3
const RANGE_TIMEOUT_MS = 3 * 60 * 1000

async function downloadRange(url: string, destPath: string, start: number, end: number): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { Range: `bytes=${start}-${end}` },
        signal: AbortSignal.timeout(RANGE_TIMEOUT_MS),
      })
      if (res.status === 404) throw new Error('source_expired')
      if (res.status !== 206 || !res.body) throw new Error(`source_download_failed ${res.status}`)
      await pipeline(
        Readable.fromWeb(res.body as unknown as NodeReadableStream),
        createWriteStream(destPath, { flags: 'r+', start }),
      )
      return
    } catch (err) {
      const expired = err instanceof Error && err.message === 'source_expired'
      if (expired || attempt >= RANGE_ATTEMPTS) throw err
      await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }
}

export async function downloadSourceToFile(storagePath: string, destPath: string): Promise<number> {
  const size = await headR2Object(storagePath)
  if (size == null) throw new Error('source_expired')
  if (size <= 0) throw new Error('source_download_failed empty')

  const handle = await open(destPath, 'w')
  await handle.truncate(size)
  await handle.close()

  const url = presignR2Url('GET', storagePath, 60 * 60)
  const ranges: [number, number][] = []
  for (let start = 0; start < size; start += RANGE_BYTES) {
    ranges.push([start, Math.min(size, start + RANGE_BYTES) - 1])
  }

  const t0 = Date.now()
  let next = 0
  let failed = false
  const lane = async () => {
    while (!failed && next < ranges.length) {
      const [start, end] = ranges[next++]
      try {
        await downloadRange(url, destPath, start, end)
      } catch (err) {
        failed = true
        throw err
      }
    }
  }
  const results = await Promise.allSettled(Array.from({ length: Math.min(PARALLEL_RANGES, ranges.length) }, lane))
  const rejected = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
  if (rejected) throw rejected.reason

  const secs = Math.max(0.001, (Date.now() - t0) / 1000)
  console.log('[VideoClips] source download speed', { mb: Math.round(size / 1e6), secs: Math.round(secs), mbPerSec: +(size / 1e6 / secs).toFixed(1) })
  return size
}

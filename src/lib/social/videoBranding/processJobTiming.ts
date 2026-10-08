import { FfmpegTimeoutError } from '@/lib/social/videoBranding/runFfmpeg'

export class VideoBrandingJobTimer {
  private readonly t0 = Date.now()
  private stageStart = this.t0
  currentStage = 'claimed'

  constructor(
    readonly jobId: string,
    readonly assetId: string,
  ) {}

  beginStage(stage: string): void {
    this.currentStage = stage
    this.stageStart = Date.now()
  }

  private elapsedMs(): number {
    return Date.now() - this.t0
  }

  private stageMs(): number {
    return Date.now() - this.stageStart
  }

  log(event: string, extra?: Record<string, unknown>): void {
    console.log(`[VideoBranding] ${event}`, {
      jobId: this.jobId,
      assetId: this.assetId,
      stageMs: this.stageMs(),
      totalMs: this.elapsedMs(),
      ...extra,
    })
    this.stageStart = Date.now()
  }

  logFailure(err: unknown): void {
    const errorCode =
      err instanceof FfmpegTimeoutError
        ? 'worker_timeout'
        : err instanceof Error
          ? err.message.slice(0, 80)
          : 'processing_failed'

    console.error('[VideoBranding] job failed', {
      jobId: this.jobId,
      assetId: this.assetId,
      stage: this.currentStage,
      errorCode,
      totalMs: this.elapsedMs(),
    })
  }
}

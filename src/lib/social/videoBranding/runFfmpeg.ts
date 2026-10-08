import { spawn, type ChildProcess } from 'node:child_process'

export const FFMPEG_TIMEOUT_MS = 10 * 60 * 1000

export class FfmpegTimeoutError extends Error {
  constructor() {
    super('ffmpeg_timeout')
    this.name = 'FfmpegTimeoutError'
  }
}

export function runProcessCapture(
  cmd: string,
  args: string[],
  timeoutMs?: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    let killTimer: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      if (killTimer) clearTimeout(killTimer)
    }

    if (timeoutMs != null && timeoutMs > 0) {
      killTimer = setTimeout(() => {
        timedOut = true
        terminateProcess(child, cmd)
      }, timeoutMs)
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (err) => {
      cleanup()
      reject(err)
    })
    child.on('close', (code) => {
      cleanup()
      if (timedOut) {
        reject(new FfmpegTimeoutError())
        return
      }
      if (code === 0) resolve(stdout)
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(0, 500)}`))
    })
  })
}

function terminateProcess(child: ChildProcess, label: string): void {
  try {
    child.kill('SIGTERM')
  } catch {
    /* ignore */
  }
  setTimeout(() => {
    try {
      if (!child.killed) child.kill('SIGKILL')
    } catch {
      console.warn(`[VideoBranding] ${label} SIGKILL failed`)
    }
  }, 5000)
}

export function runFfmpeg(args: string[], timeoutMs = FFMPEG_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    let timedOut = false
    let killTimer: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      if (killTimer) clearTimeout(killTimer)
    }

    killTimer = setTimeout(() => {
      timedOut = true
      terminateProcess(child, 'ffmpeg')
    }, timeoutMs)

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (err) => {
      cleanup()
      reject(err)
    })
    child.on('close', (code) => {
      cleanup()
      if (timedOut) {
        reject(new FfmpegTimeoutError())
        return
      }
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(0, 800)}`))
    })
  })
}

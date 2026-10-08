export type VideoDisplayProbe = {
  storedWidth: number
  storedHeight: number
  displayWidth: number
  displayHeight: number
  rotation: number
  hasAudio: boolean
  duration: number | null
  /** ffprobe r_frame_rate, e.g. "30/1". */
  fps: string | null
}

type FfprobeStream = {
  width?: number
  height?: number
  r_frame_rate?: string
  tags?: { rotate?: string }
  side_data_list?: Array<{ rotation?: number }>
}

function parseRotationFromStream(stream: FfprobeStream | undefined): number {
  if (!stream) return 0

  const tagRotate = stream.tags?.rotate
  if (tagRotate != null && tagRotate !== '') {
    const n = Number(tagRotate)
    if (Number.isFinite(n)) return normalizeRotation(n)
  }

  for (const side of stream.side_data_list ?? []) {
    if (typeof side.rotation === 'number' && Number.isFinite(side.rotation)) {
      return normalizeRotation(side.rotation)
    }
  }

  return 0
}

export function normalizeRotation(degrees: number): number {
  const n = ((Math.round(degrees) % 360) + 360) % 360
  if (n === 90 || n === 180 || n === 270) return n
  return 0
}

export function displayDimensionsFromStored(
  width: number,
  height: number,
  rotation: number,
): { displayWidth: number; displayHeight: number } {
  if (rotation === 90 || rotation === 270) {
    return { displayWidth: height, displayHeight: width }
  }
  return { displayWidth: width, displayHeight: height }
}

export function parseFfprobeVideoJson(raw: string): VideoDisplayProbe {
  const parsed = JSON.parse(raw) as {
    streams?: FfprobeStream[]
    format?: { duration?: string }
  }

  const videoStream = parsed.streams?.find((s) => s.width != null && s.height != null)
  const storedWidth = videoStream?.width ?? 0
  const storedHeight = videoStream?.height ?? 0
  const rotation = parseRotationFromStream(videoStream)
  const { displayWidth, displayHeight } = displayDimensionsFromStored(
    storedWidth,
    storedHeight,
    rotation,
  )

  const hasAudio = (parsed.streams ?? []).some(
    (s) => (s as { codec_type?: string }).codec_type === 'audio',
  )

  const duration = parsed.format?.duration ? Number(parsed.format.duration) : null

  const fps = videoStream?.r_frame_rate?.trim() || null

  return {
    storedWidth,
    storedHeight,
    displayWidth,
    displayHeight,
    rotation,
    hasAudio,
    duration: duration != null && Number.isFinite(duration) ? duration : null,
    fps,
  }
}

/** ffprobe argv for display geometry + audio detection. */
export function ffprobeVideoArgs(filePath: string): string[] {
  return [
    '-v',
    'error',
    '-show_entries',
    'stream=width,height,r_frame_rate,codec_type',
    '-show_entries',
    'stream_tags=rotate',
    '-show_entries',
    'stream_side_data=rotation',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    filePath,
  ]
}

export function ffprobeLogoArgs(filePath: string): string[] {
  return [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'json',
    filePath,
  ]
}

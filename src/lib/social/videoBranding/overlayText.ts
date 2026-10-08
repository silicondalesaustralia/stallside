/** Strip emoji / pictographs - DejaVu cannot render them reliably in V1. */
const EMOJI_RE = /\p{Extended_Pictographic}/gu

export function stripEmojiFromOverlayText(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim()
}

/**
 * Prepare a single line for FFmpeg drawtext textfile= content.
 * Percent must be doubled; newlines/control chars removed.
 */
export function prepareDrawtextFileLine(line: string): string {
  return line
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/%/g, '%%')
    .trim()
}

export const DEJAVU_SANS_BOLD_PATH =
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

/** Escape a filesystem path for FFmpeg filter graph (textfile=). */
export function escapeFfmpegFilterPath(filePath: string): string {
  return filePath
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
}

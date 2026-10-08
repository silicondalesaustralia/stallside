export type SniffedUploadKind = 'pdf' | 'jpeg' | 'png' | 'webp'

const JPEG_MIME = 'image/jpeg'
const PNG_MIME = 'image/png'
const WEBP_MIME = 'image/webp'
const PDF_MIME = 'application/pdf'

export function sniffUploadKind(buffer: Buffer): SniffedUploadKind | null {
  if (buffer.length < 4) return null

  if (buffer.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf'

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg'

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png'
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

export function mimeForSniffedKind(kind: SniffedUploadKind): string {
  if (kind === 'pdf') return PDF_MIME
  if (kind === 'jpeg') return JPEG_MIME
  if (kind === 'png') return PNG_MIME
  return WEBP_MIME
}

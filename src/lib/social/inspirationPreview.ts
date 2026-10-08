export function buildInspirationPreviewSrc(payload: {
  base64: string
  mimeType: string
}): string | null {
  const mime = payload.mimeType.trim()
  const base64 = payload.base64.trim()
  if (!mime || !base64) return null
  return `data:${mime};base64,${base64}`
}

export function createInspirationObjectUrl(file: Blob): string {
  return URL.createObjectURL(file)
}

export function revokeInspirationPreviewSrc(src: string | null | undefined): void {
  if (src && src.startsWith('blob:')) {
    URL.revokeObjectURL(src)
  }
}

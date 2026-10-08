const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function inspirationExtForMime(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType.trim().toLowerCase()] ?? null
}

export function isAllowedInspirationMime(mimeType: string): boolean {
  return inspirationExtForMime(mimeType) != null
}

/** Map browser File.type / filename onto an allowed inspiration MIME. */
export function resolveInspirationUploadMime(file: { type?: string; name?: string }): string | null {
  const raw = file.type?.trim().toLowerCase() ?? ''
  if (raw && inspirationExtForMime(raw)) {
    return raw === 'image/jpg' ? 'image/jpeg' : raw
  }
  const ext = file.name?.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return null
}

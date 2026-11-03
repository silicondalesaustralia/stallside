import { uploadFileWithProgress } from '@/components/social/VideoLibraryCard'
import { uploadFileInParts } from '@/components/tradiespost/videos/uploadMultipart'
import { signedResumableEndpoint, uploadResumableSigned } from '@/lib/social/tusUpload'
import {
  SOCIAL_VIDEO_ERRORS,
  SOCIAL_VIDEO_RESUMABLE_THRESHOLD_BYTES,
} from '@/lib/social/videoUploadLimits'

type Multipart = { uploadId: string; partSize: number; partUrls: string[] }

function parseMultipart(value: unknown): Multipart | null {
  if (!value || typeof value !== 'object') return null
  const { uploadId, partSize, partUrls } = value as Record<string, unknown>
  if (typeof uploadId !== 'string' || typeof partSize !== 'number' || !Array.isArray(partUrls)) return null
  const urls = partUrls.filter((u): u is string => typeof u === 'string')
  return urls.length > 0 && urls.length === partUrls.length ? { uploadId, partSize, partUrls: urls } : null
}

/**
 * Uploads to whatever `/api/social/media-assets/upload-url` returned: R2 (single PUT or
 * multipart) or Supabase (single PUT, or resumable TUS chunks for large files).
 * Returns the multipart upload id that finalize must complete.
 */
export async function uploadSocialVideoFile(
  file: File,
  target: Record<string, unknown>,
  onProgress: (percent: number) => void,
): Promise<{ uploadId?: string }> {
  const multipart = parseMultipart(target.multipart)
  if (multipart) {
    await uploadFileInParts({ file, ...multipart, onProgress })
    return { uploadId: multipart.uploadId }
  }

  const signedUrl = typeof target.signedUrl === 'string' ? target.signedUrl : ''
  if (!signedUrl) throw new Error(SOCIAL_VIDEO_ERRORS.uploadFailed)

  if (target.storage === 'r2' || file.size <= SOCIAL_VIDEO_RESUMABLE_THRESHOLD_BYTES) {
    await uploadFileWithProgress(signedUrl, file, file.type, onProgress)
    return {}
  }
  await uploadResumableSigned({
    endpoint: signedResumableEndpoint(new URL(signedUrl).origin),
    token: String(target.token ?? ''),
    bucket: String(target.bucket ?? ''),
    objectName: String(target.path ?? ''),
    contentType: file.type,
    size: file.size,
    readChunk: async (start, end) => file.slice(start, end),
    onProgress,
  })
  return {}
}

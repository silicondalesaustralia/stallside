import { libraryR2PublicBaseUrl } from '@/lib/social/libraryVideoR2'
import { headR2Object, isR2Configured, presignR2Url } from '@/lib/social/videoClips/r2'
import {
  MULTIPART_MIN_FILE_BYTES,
  MULTIPART_PART_BYTES,
  completeMultipartUpload,
  createMultipartUpload,
  multipartPartCount,
  presignPartUrls,
} from '@/lib/social/videoClips/r2Multipart'

const UPLOAD_URL_TTL_SECONDS = 6 * 60 * 60

/** New Library uploads go to R2 once the bucket's public domain is configured. */
export function isLibraryR2Enabled(): boolean {
  return Boolean(libraryR2PublicBaseUrl()) && isR2Configured()
}

export type LibraryR2UploadTarget =
  | { signedUrl: string }
  | { multipart: { uploadId: string; partSize: number; partUrls: string[] } }

export async function presignLibraryR2Upload(
  key: string,
  mimeType: string,
  size: number,
): Promise<LibraryR2UploadTarget> {
  if (size < MULTIPART_MIN_FILE_BYTES) {
    return { signedUrl: presignR2Url('PUT', key, UPLOAD_URL_TTL_SECONDS) }
  }
  const uploadId = await createMultipartUpload(key, mimeType)
  return {
    multipart: {
      uploadId,
      partSize: MULTIPART_PART_BYTES,
      partUrls: presignPartUrls(key, uploadId, multipartPartCount(size), UPLOAD_URL_TTL_SECONDS),
    },
  }
}

/** Completes a multipart upload when needed; returns the stored size, or null if missing. */
export async function finalizeLibraryR2Upload(
  key: string,
  uploadId: string | null,
  declaredSize: number,
): Promise<number | null> {
  if (uploadId) {
    await completeMultipartUpload(key, uploadId, multipartPartCount(declaredSize))
  }
  return headR2Object(key)
}

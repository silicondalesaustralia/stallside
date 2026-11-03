import { uploadFileWithProgress } from '@/components/social/VideoLibraryCard'
import { signedResumableEndpoint, uploadResumableSigned } from '@/lib/social/tusUpload'
import { SOCIAL_VIDEO_RESUMABLE_THRESHOLD_BYTES } from '@/lib/social/videoUploadLimits'

export type SignedVideoUpload = {
  signedUrl: string
  token: string
  bucket: string
  path: string
}

/** Small files use a single signed PUT; large ones use resumable TUS chunks. */
export async function uploadSocialVideoFile(
  file: File,
  target: SignedVideoUpload,
  onProgress: (percent: number) => void,
): Promise<void> {
  if (file.size <= SOCIAL_VIDEO_RESUMABLE_THRESHOLD_BYTES) {
    await uploadFileWithProgress(target.signedUrl, file, file.type, onProgress)
    return
  }
  await uploadResumableSigned({
    endpoint: signedResumableEndpoint(new URL(target.signedUrl).origin),
    token: target.token,
    bucket: target.bucket,
    objectName: target.path,
    contentType: file.type,
    size: file.size,
    readChunk: async (start, end) => file.slice(start, end),
    onProgress,
  })
}

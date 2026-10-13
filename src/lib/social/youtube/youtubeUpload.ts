// ============================================================
// lib/social/youtube/youtubeUpload.ts
// YouTube Data API v3 videos.insert via the resumable protocol:
// one POST for the session URL, then one PUT with the bytes.
// ============================================================

import {
  cleanYouTubeDescription,
  type YouTubePostSettings,
} from '@/lib/social/youtube/youtubeSettings'

const UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status'

/** Body for videos.insert. Product videos are declared not made for kids. */
export function youtubeVideoResource(settings: YouTubePostSettings, caption: string) {
  return {
    snippet: {
      title: settings.title,
      description: cleanYouTubeDescription(caption),
      categoryId: '22',
    },
    status: {
      privacyStatus: settings.privacy,
      selfDeclaredMadeForKids: false,
    },
  }
}

type GoogleErrorBody = { error?: { message?: string; errors?: { reason?: string }[] } }

async function googleErrorMessage(res: Response, fallback: string): Promise<string> {
  let json: GoogleErrorBody = {}
  try {
    json = JSON.parse(await res.text()) as GoogleErrorBody
  } catch {
    // Non-JSON error body: fall through to the status message.
  }
  const reason = json.error?.errors?.[0]?.reason
  if (reason === 'quotaExceeded' || reason === 'uploadLimitExceeded') {
    return 'YouTube daily upload limit reached - try again tomorrow.'
  }
  return json.error?.message || `${fallback} (${res.status})`
}

/** Uploads the video and returns its YouTube video id. */
export async function uploadYouTubeVideo(params: {
  accessToken: string
  bytes: Uint8Array<ArrayBuffer>
  mimeType: string
  settings: YouTubePostSettings
  caption: string
}): Promise<string> {
  const init = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': String(params.bytes.byteLength),
      'X-Upload-Content-Type': params.mimeType,
    },
    body: JSON.stringify(youtubeVideoResource(params.settings, params.caption)),
  })
  if (!init.ok) {
    const message = await googleErrorMessage(init, 'YouTube upload could not start')
    console.error('[YouTube] Upload session failed', { status: init.status, message })
    throw new Error(message)
  }
  const sessionUrl = init.headers.get('location')
  if (!sessionUrl) throw new Error('YouTube did not return an upload URL')

  const put = await fetch(sessionUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': params.mimeType,
      'Content-Length': String(params.bytes.byteLength),
    },
    body: params.bytes,
  })
  if (!put.ok) {
    const message = await googleErrorMessage(put, 'YouTube video upload failed')
    console.error('[YouTube] Upload failed', { status: put.status, message })
    throw new Error(message)
  }
  const video = (await put.json()) as { id?: string }
  if (!video.id) throw new Error('YouTube upload returned no video id')
  return video.id
}

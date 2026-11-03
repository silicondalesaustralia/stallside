import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { groupWordsIntoCues, parseCaptionsDoc } from '../../../src/lib/social/videoClips/captionCues'
import { extractAudioArgs } from '../../../src/lib/social/videoClips/clipFfmpegArgs'
import { transcribeWords } from '../../../src/lib/social/videoClips/transcribeWords'
import { isLibraryR2Path } from '../../../src/lib/social/libraryVideoR2'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { SOCIAL_VIDEO_BUCKET } from './supabase'
import { downloadSourceToFile } from './sourceDownload'
import { downloadStorageObject } from './storageTransfer'

/** OpenAI rejects audio uploads over 25 MB. */
const MAX_AUDIO_BYTES = 25 * 1024 * 1024

type LibraryAsset = { id: string; storage_path: string; mime_type: string | null; captions: unknown }

/** Transcribes an uploaded Library video and stores word timings + caption cues for the editor. */
export async function transcribeLibraryAsset(db: SupabaseClient, asset: LibraryAsset, workDir: string): Promise<void> {
  const ext = asset.mime_type === 'video/quicktime' ? 'mov' : 'mp4'
  const videoPath = join(workDir, `source.${ext}`)
  if (isLibraryR2Path(asset.storage_path)) {
    await downloadSourceToFile(asset.storage_path, videoPath)
  } else {
    await downloadStorageObject(db, SOCIAL_VIDEO_BUCKET, asset.storage_path, videoPath)
  }

  const audioPath = join(workDir, 'audio.mp3')
  await runFfmpeg(extractAudioArgs(videoPath, audioPath))
  if ((await stat(audioPath)).size > MAX_AUDIO_BYTES) throw new Error('audio_too_long_for_captions')

  const transcript = await transcribeWords(audioPath)
  const doc = parseCaptionsDoc(asset.captions)
  const { error } = await db
    .from('social_media_assets')
    .update({
      captions: { ...doc, words: transcript.words, cues: groupWordsIntoCues(transcript.words) },
      updated_at: new Date().toISOString(),
    })
    .eq('id', asset.id)
  if (error) throw new Error(`caption_asset_update_failed: ${error.message}`)
}

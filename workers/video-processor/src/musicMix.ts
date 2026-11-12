import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { findMusicTrack, musicTrackUrl } from '../../../src/lib/social/music/musicCatalog'
import { musicMixArgs } from '../../../src/lib/social/music/musicMixArgs'
import type { MusicChoice } from '../../../src/lib/social/music/musicTypes'
import { runFfmpeg } from '../../../src/lib/social/videoBranding/runFfmpeg'
import { probeVideoDisplay } from '../../../src/lib/social/videoBranding/processBrandingLocally'

/**
 * Mixes the chosen library track into a finished video. Returns the new file,
 * or the input path unchanged when there is no music.
 */
export async function mixMusicIntoVideo(input: {
  videoPath: string
  music: MusicChoice | null | undefined
  workDir: string
}): Promise<string> {
  const track = findMusicTrack(input.music?.trackId)
  if (!input.music || !track) return input.videoPath
  const url = musicTrackUrl(track)
  if (!url) throw new Error('music_url_unavailable')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`music_download_failed ${res.status}`)
  const musicPath = join(input.workDir, `${randomUUID()}.mp3`)
  await writeFile(musicPath, Buffer.from(await res.arrayBuffer()))

  const probe = await probeVideoDisplay(input.videoPath)
  const outputPath = join(input.workDir, `${randomUUID()}-music.mp4`)
  await runFfmpeg(
    musicMixArgs({
      videoPath: input.videoPath,
      musicPath,
      outputPath,
      durationSeconds: probe.duration ?? 0,
      hasAudio: probe.hasAudio,
      music: input.music,
    }),
  )
  console.log('[Music] mixed', { trackId: track.id, volume: input.music.volume, originalVolume: input.music.originalVolume })
  return outputPath
}

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  prepareDrawtextFileLine,
  stripEmojiFromOverlayText,
} from '@/lib/social/videoBranding/overlayText'
import { wrapOverlayTextLines } from '@/lib/social/videoBranding/validation'
import { wrapVideoHeadlineLines } from '@/lib/social/videoBranding/headlineStyle'
import type { VideoHeadlineAlign } from '@/lib/social/videoBranding/types'

/** Write drawtext textfile= inputs; returns paths (one per line). */
export async function writeOverlayTextFiles(
  workDir: string,
  overlayText: string | null | undefined,
  wrapParams?: {
    videoWidth: number
    fontSize: number
    align: VideoHeadlineAlign
  },
): Promise<string[]> {
  if (!overlayText?.trim()) return []

  const stripped = stripEmojiFromOverlayText(overlayText)
  if (!stripped) return []

  let lines: string[]
  if (wrapParams) {
    lines = wrapVideoHeadlineLines(stripped, wrapParams).lines
  } else {
    lines = wrapOverlayTextLines(stripped)
  }
  const paths: string[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const filePath = join(workDir, `overlay-text-${i}.txt`)
    await writeFile(filePath, prepareDrawtextFileLine(lines[i]), 'utf8')
    paths.push(filePath)
  }

  return paths
}

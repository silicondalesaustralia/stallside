import { parseCaptionsDoc } from './captionCues'
import { mapCaptionsToOutput } from './timeline'

/** Keeps the caption prompt small; a 5-minute video is roughly 4–5k characters. */
export const SCRIPT_PROMPT_MAX_CHARS = 6000

/** What is said in the published clip (cut sections removed), from its edited caption cues. */
export function clipScriptText(captions: unknown): string {
  const doc = parseCaptionsDoc(captions)
  const cues = doc.segments ? mapCaptionsToOutput(doc.cues, doc.words, doc.segments).cues : doc.cues
  return cues
    .map((c) => c.text.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function scriptFileName(title: string | null): string {
  const base = (title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return `${base || 'video'}-script.txt`
}

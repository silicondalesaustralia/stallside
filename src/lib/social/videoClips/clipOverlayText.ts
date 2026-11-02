import { parseCaptionsDoc } from './captionCues'
import { mapTimedToOutput } from './timeline'

export const MAX_PROMPT_OVERLAYS = 12

/** On-screen text layers that survive the edit's cuts, in play order, de-duplicated. */
export function clipOverlayTexts(captions: unknown): string[] {
  const doc = parseCaptionsDoc(captions)
  const overlays = doc.segments ? mapTimedToOutput(doc.overlays, doc.segments) : doc.overlays
  const seen = new Set<string>()
  const texts: string[] = []
  for (const overlay of [...overlays].sort((a, b) => a.s - b.s)) {
    const text = overlay.text.replace(/\s+/g, ' ').trim()
    const key = text.toLowerCase()
    if (!text || seen.has(key)) continue
    seen.add(key)
    texts.push(text)
    if (texts.length >= MAX_PROMPT_OVERLAYS) break
  }
  return texts
}

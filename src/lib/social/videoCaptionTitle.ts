export const VIDEO_POST_TITLE_MAX = 70

export type VideoCaptionResult = { caption: string; title: string | null }

export function cleanVideoPostTitle(raw: string | null | undefined): string | null {
  const text = (raw ?? '')
    .replace(/[<>]/g, '')
    .replace(/#\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“‘]+|["'”’]+$/g, '')
    .trim()
  if (!text) return null
  if (text.length <= VIDEO_POST_TITLE_MAX) return text
  const cut = text.slice(0, VIDEO_POST_TITLE_MAX)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 30 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–-]+$/, '')
}

function firstSentence(text: string | null | undefined): string | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  return trimmed.split(/(?<=[.!?])\s|\n/)[0] ?? trimmed
}

/** Used when the model returns no title: the seller's video name, then the clip title, then the description. */
export function fallbackVideoPostTitle(input: {
  sourceTitle?: string | null
  clipTitle?: string | null
  aboutText?: string | null
}): string | null {
  return (
    cleanVideoPostTitle(input.sourceTitle) ||
    cleanVideoPostTitle(input.clipTitle) ||
    cleanVideoPostTitle(firstSentence(input.aboutText))
  )
}

/** Model output is `{"caption": "...", "title": "..."}`; plain text is treated as the caption alone. */
export function parseVideoCaptionResponse(raw: string): VideoCaptionResult | null {
  const text = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
  if (!text) return null
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const { caption, title } = parsed as Record<string, unknown>
      if (typeof caption === 'string' && caption.trim()) {
        return { caption: caption.trim(), title: typeof title === 'string' ? cleanVideoPostTitle(title) : null }
      }
      return null
    }
  } catch {
    // Not JSON: older-style plain caption.
  }
  return text.startsWith('{') ? null : { caption: text, title: null }
}

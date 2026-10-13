export const X_TEXT_MAX = 280

/**
 * X counts every link as 23 characters (t.co) and most emoji/CJK as 2.
 * This approximation errs long so a post that passes here passes on X.
 */
export function xTextLength(text: string): number {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))
  let length = 0
  for (const ch of withoutUrls) length += (ch.codePointAt(0) ?? 0) > 0x10ff ? 2 : 1
  return length
}

/** Default X text from the shared caption: whole caption if it fits, else cut at a word with "…". */
export function defaultXText(caption: string): string {
  const text = caption.trim()
  if (xTextLength(text) <= X_TEXT_MAX) return text
  let cut = ''
  for (const word of text.split(/(\s+)/)) {
    if (xTextLength(`${cut}${word}…`) > X_TEXT_MAX) break
    cut += word
  }
  return `${cut.trimEnd() || text.slice(0, X_TEXT_MAX - 1)}…`
}

export function xTextBlockReason(text: string): string | null {
  if (!text.trim()) return 'Write the text for X.'
  return xTextLength(text) > X_TEXT_MAX ? `X posts are limited to ${X_TEXT_MAX} characters.` : null
}

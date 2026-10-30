/** YouTube's limit for all tags combined, counted by youtubeTagsLength. */
export const YOUTUBE_TAGS_MAX_CHARS = 500

/** YouTube counts commas between tags, and quotes around any tag containing a space. */
export function youtubeTagsLength(tags: string[]): number {
  const chars = tags.reduce((sum, tag) => sum + tag.length + (tag.includes(' ') ? 2 : 0), 0)
  return chars + Math.max(tags.length - 1, 0)
}

function cleanTag(raw: string): string {
  return raw.replace(/[<>]/g, '').trim().replace(/^#+/, '').replace(/\s+/g, ' ').trim()
}

/** Comma-separated text (or a stored list) to unique tags, dropping any past the 500-char limit. */
export function parseYouTubeTags(raw: string | string[]): string[] {
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((part) => part.split(','))
  const tags: string[] = []
  const seen = new Set<string>()
  for (const part of parts) {
    const tag = cleanTag(part)
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    if (youtubeTagsLength([...tags, tag]) > YOUTUBE_TAGS_MAX_CHARS) break
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

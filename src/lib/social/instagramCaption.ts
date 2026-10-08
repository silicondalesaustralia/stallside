// ============================================================
// lib/social/instagramCaption.ts
// Instagram rejects captions over 2,200 characters or with more
// than 30 hashtags (both reported as "The caption was too long").
// ============================================================

export const INSTAGRAM_MAX_HASHTAGS = 30
export const INSTAGRAM_MAX_CAPTION_CHARS = 2200

const HASHTAG = /#[\p{L}\p{N}_]+/gu

export function fitInstagramCaption(caption: string): string {
  let kept = 0
  let out = caption.replace(HASHTAG, (tag) => (++kept <= INSTAGRAM_MAX_HASHTAGS ? tag : ''))

  out = out
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const chars = [...out]
  if (chars.length > INSTAGRAM_MAX_CAPTION_CHARS) {
    out = chars.slice(0, INSTAGRAM_MAX_CAPTION_CHARS).join('').trimEnd()
  }
  return out
}

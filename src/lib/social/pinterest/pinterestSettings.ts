export const PINTEREST_TITLE_MAX = 100
export const PINTEREST_DESCRIPTION_MAX = 800
export const PINTEREST_ALT_TEXT_MAX = 500
const LINK_MAX = 2048

export type PinterestPostSettings = {
  boardId: string
  boardName: string
  title: string
  link: string | null
}

export type PinterestSettingsDraft = {
  boardId: string
  boardName: string
  title: string
  link: string
}

export const EMPTY_PINTEREST_DRAFT: PinterestSettingsDraft = { boardId: '', boardName: '', title: '', link: '' }

export function cleanPinterestTitle(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, PINTEREST_TITLE_MAX).trim()
}

export function cleanPinterestDescription(raw: string): string {
  return raw.trim().slice(0, PINTEREST_DESCRIPTION_MAX)
}

/** Strip wrapping quotes / hashtags an AI title sometimes has, then apply the Pin title limits. */
export function tidyPinterestTitle(raw: string): string {
  const unquoted = raw.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
  return cleanPinterestTitle(unquoted.replace(/#\S+/g, '').trim().replace(/\.$/, ''))
}

/** First non-empty caption line, used when the seller leaves the title blank. */
export function defaultPinterestTitle(caption: string): string {
  const firstLine = caption.split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  return cleanPinterestTitle(firstLine)
}

/** https/http URL or null; anything else is rejected. */
export function cleanPinterestLink(raw: string): string | null | 'invalid' {
  const value = raw.trim()
  if (!value) return null
  if (value.length > LINK_MAX) return 'invalid'
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : 'invalid'
  } catch {
    return 'invalid'
  }
}

export function sanitizePinterestSettings(raw: unknown): PinterestPostSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const { boardId, boardName, title, link } = raw as Record<string, unknown>
  if (typeof boardId !== 'string' || !/^[\w-]{1,64}$/.test(boardId)) return null
  if (typeof title !== 'string') return null
  const cleanTitle = cleanPinterestTitle(title)
  if (!cleanTitle) return null
  const cleanLink = typeof link === 'string' ? cleanPinterestLink(link) : null
  if (cleanLink === 'invalid') return null
  return {
    boardId,
    boardName: typeof boardName === 'string' ? boardName.slice(0, 180) : '',
    title: cleanTitle,
    link: cleanLink,
  }
}

export function pinterestSettingsFromDraft(
  draft: PinterestSettingsDraft,
  caption: string,
): { settings: PinterestPostSettings | null; blockReason: string | null } {
  if (!draft.boardId) return { settings: null, blockReason: 'Pick a Pinterest board.' }
  const link = cleanPinterestLink(draft.link)
  if (link === 'invalid') return { settings: null, blockReason: 'The Pinterest link must start with https://' }
  const title = cleanPinterestTitle(draft.title) || defaultPinterestTitle(caption)
  if (!title) return { settings: null, blockReason: 'Add a Pin title.' }
  return { settings: { boardId: draft.boardId, boardName: draft.boardName, title, link }, blockReason: null }
}

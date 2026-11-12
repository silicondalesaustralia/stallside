/** Parses archived FreePD.com category pages (web.archive.org) into track rows. */

export type FreePdRow = {
  title: string
  file: string
  artist: string
  description: string
  pageCategory: string
  rank: number
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function parseFreePdPage(html: string, pageCategory: string): FreePdRow[] {
  const rows = html.split(/<\/tr>\s*<tr>|<table>\s*<tr>/i).slice(1)
  const out: FreePdRow[] = []
  for (const row of rows) {
    const title = row.match(/<B>([^<]+)<\/B>/i)?.[1]
    const file = row.match(/src="[^"]*\/music\/([^"]+)\.mp3"/i)?.[1]
    const credit = row.match(/Written by\s*(?:<A[^>]*>)?([^<.]+)(?:<\/A>)?\.?\s*([\s\S]*?)<\/td>/i)
    if (!title || !file) continue
    const description = decode(credit?.[2] ?? '')
      .replace(/This music is available for commercial and non-commercial purposes\.?/i, '')
      .replace(/Added [A-Z][a-z]+,? \d{4}\.?/g, '')
      .trim()
    out.push({
      title: decode(title),
      file: decode(file),
      artist: decode(credit?.[1] ?? 'Unknown'),
      description,
      pageCategory,
      rank: out.length,
    })
  }
  return out
}

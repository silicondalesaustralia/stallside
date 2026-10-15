const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };

function decode(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e: string) => ENTITIES[e] ?? "");
}

function meta(html: string, name: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i");
  const m = html.match(re) ?? html.match(alt);
  return m ? decode(m[1]).trim() : null;
}

export type ExtractedPage = { title: string | null; text: string; photoUrls: string[] };

/** Readable text, title and candidate photos from untrusted HTML. Never executes anything. */
export function extractPage(html: string, baseUrl: string): ExtractedPage {
  const title = meta(html, "og:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
  const description = meta(html, "og:description") ?? meta(html, "description");
  const body = html
    .replace(/<(script|style|noscript|svg|iframe|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const text = decode([description, body].filter(Boolean).join("\n"))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 12_000);

  const urls = new Set<string>();
  const og = meta(html, "og:image");
  if (og) urls.add(og);
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    if (urls.size >= 12) break;
    urls.add(m[1]);
  }
  const photoUrls = [...urls]
    .map((u) => {
      try {
        return new URL(decode(u), baseUrl).toString();
      } catch {
        return null;
      }
    })
    .filter((u): u is string => Boolean(u && u.startsWith("https://") && !/\.svg(\?|$)/i.test(u)))
    .slice(0, 12);
  return { title: title ? decode(title).slice(0, 200) : null, text, photoUrls };
}

const SOCIAL_HOSTS = /(^|\.)(facebook\.com|fb\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com)$/i;

export function isSocialHost(url: string): boolean {
  try {
    return SOCIAL_HOSTS.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

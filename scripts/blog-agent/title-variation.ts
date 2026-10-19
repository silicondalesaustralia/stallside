const SIMILARITY_LIMIT = 0.75;

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}

/** True when the H1 and SEO title share most of their words (e.g. a reorder or added suffix). */
export function titlesTooSimilar(title: string, seoTitle: string): boolean {
  const a = words(title);
  const b = words(seoTitle);
  if (a.size === 0 || b.size === 0) return false;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.min(a.size, b.size) >= SIMILARITY_LIMIT;
}

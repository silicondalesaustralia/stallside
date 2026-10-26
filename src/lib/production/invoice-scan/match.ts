export type MatchCandidate = { id: string; name: string; supplier: string | null };

const STOP_WORDS = new Set(["the", "and", "with", "pack", "bag", "box", "of", "x", "pk", "ctn", "each", "ea"]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
}

/**
 * Best existing material for an invoice line, or null. Scores word overlap against the material
 * name (most of the material's words must appear on the line); a matching supplier breaks ties.
 */
export function matchMaterial(
  description: string,
  supplier: string | null,
  materials: MatchCandidate[],
): string | null {
  const lineTokens = new Set(tokens(description));
  if (lineTokens.size === 0) return null;
  const supplierKey = supplier?.trim().toLowerCase() ?? "";

  let best: { id: string; score: number } | null = null;
  for (const material of materials) {
    const nameTokens = tokens(material.name);
    if (nameTokens.length === 0) continue;
    const hits = nameTokens.filter((t) => lineTokens.has(t)).length;
    let score = hits / nameTokens.length;
    if (score > 0 && supplierKey && material.supplier?.trim().toLowerCase() === supplierKey) score += 0.1;
    if (!best || score > best.score) best = { id: material.id, score };
  }
  return best && best.score >= 0.6 ? best.id : null;
}

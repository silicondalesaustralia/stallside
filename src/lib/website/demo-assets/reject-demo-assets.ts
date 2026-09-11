/**
 * Seller drafts may use /demo/kits/* as editable style starters.
 * Other /demo/ paths remain forbidden in site specs.
 */
const FORBIDDEN_DEMO = /(?:^|["'\s(])\/demo\/(?!kits\/)/i;

export function findDemoAssetReferences(value: unknown, path = "$"): string[] {
  const hits: string[] = [];
  if (typeof value === "string") {
    if (FORBIDDEN_DEMO.test(value)) {
      hits.push(`${path}: ${value.slice(0, 120)}`);
    }
    return hits;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => hits.push(...findDemoAssetReferences(item, `${path}[${i}]`)));
    return hits;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      hits.push(...findDemoAssetReferences(entry, `${path}.${key}`));
    }
  }
  return hits;
}

export function assertNoDemoAssets(value: unknown, label = "site spec"): void {
  const hits = findDemoAssetReferences(value);
  if (hits.length > 0) {
    throw new Error(
      `${label} references demo assets (forbidden):\n${hits.slice(0, 8).join("\n")}`,
    );
  }
}

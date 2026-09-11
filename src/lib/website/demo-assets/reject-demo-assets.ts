/**
 * Seller site specs must never reference demo kit assets (Phase 8D.1 §11).
 */
const DEMO_PATH = /(?:^|["'\s(])\/demo\//i;
const DEMO_HOST_HINT = /demo\/kits\//i;

export function findDemoAssetReferences(value: unknown, path = "$"): string[] {
  const hits: string[] = [];
  if (typeof value === "string") {
    if (DEMO_PATH.test(value) || DEMO_HOST_HINT.test(value)) {
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

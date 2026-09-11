import type { WebsiteBlueprint } from "./types";
import { listWebsiteBlueprints } from "./registry";

const DIMS = [
  "header",
  "hero",
  "merch",
  "grid",
  "card",
  "image",
  "spacing",
  "mode",
  "displayFont",
] as const;

function dims(a: WebsiteBlueprint, b: WebsiteBlueprint): number {
  let n = 0;
  if (a.layout.header !== b.layout.header) n++;
  if (a.layout.hero !== b.layout.hero) n++;
  if (a.layout.merch !== b.layout.merch) n++;
  if (
    a.layout.gridColumns.desktop !== b.layout.gridColumns.desktop ||
    a.layout.gridColumns.mobile !== b.layout.gridColumns.mobile
  ) {
    n++;
  }
  if (a.layout.cardTreatment !== b.layout.cardTreatment) n++;
  if (a.layout.imageShape !== b.layout.imageShape) n++;
  if (a.layout.sectionSpacing !== b.layout.sectionSpacing) n++;
  if (a.layout.colourMode !== b.layout.colourMode) n++;
  if (a.brandKit.typography.display.family !== b.brandKit.typography.display.family) {
    n++;
  }
  return n;
}

/** Phase 8D.1 §6.2 — throws with a message if registry rules fail. */
export function assertBlueprintDistinctness(blueprints = listWebsiteBlueprints()): void {
  const heroes = new Set(blueprints.map((b) => b.layout.hero));
  const merchs = new Set(blueprints.map((b) => b.layout.merch));
  if (heroes.size !== blueprints.length) {
    throw new Error("layout.hero must be unique across blueprints");
  }
  if (merchs.size !== blueprints.length) {
    throw new Error("layout.merch must be unique across blueprints");
  }

  const headerCounts = new Map<string, number>();
  for (const b of blueprints) {
    headerCounts.set(b.layout.header, (headerCounts.get(b.layout.header) ?? 0) + 1);
  }
  for (const [header, count] of headerCounts) {
    if (count > 2) {
      throw new Error(`header ${header} used by more than two blueprints`);
    }
  }

  const displayFonts = blueprints.map((b) => b.brandKit.typography.display.family);
  if (new Set(displayFonts).size !== displayFonts.length) {
    throw new Error("display fonts must be unique across blueprints");
  }

  for (let i = 0; i < blueprints.length; i++) {
    for (let j = i + 1; j < blueprints.length; j++) {
      const a = blueprints[i]!;
      const b = blueprints[j]!;
      const diff = dims(a, b);
      if (diff < 4) {
        throw new Error(
          `${a.id} vs ${b.id} differ on only ${diff} of ${DIMS.length} layout dimensions`,
        );
      }
    }
  }

  for (const b of blueprints) {
    if (b.cardDescription.length > 50) {
      throw new Error(`${b.id} cardDescription exceeds 50 chars`);
    }
  }
}

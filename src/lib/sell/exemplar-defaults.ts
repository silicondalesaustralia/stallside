/** Worked calculator defaults for the six §15 prototype markets. */

export const EXEMPLAR_BATCH_VALUES: Record<string, Record<string, number>> = {
  candles: {
    wax: 20,
    fragrance: 8,
    wicks: 2,
    "jars-and-lids": 18,
    labour: 15,
    "allocated-overhead": 5,
  },
  // Blueprint §21: batch 48 → 8 bags + 0.50 pack = 6.50
  cookies: {
    "dough-and-ingredients": 36,
    "baking-labour": 12,
  },
  crochet: {
    "yarn-quantity": 9,
    "hooks-overhead-allocation": 2,
    "making-hours": 28,
  },
  "3d-printed-products": {
    "filament-or-resin": 14,
    "machine-allocation": 10,
    "active-finishing-labour": 8,
  },
  pottery: {
    clay: 8,
    glaze: 5,
    "firing-allocation": 7,
    "rejects-and-labour": 18,
  },
  "wooden-signs": {
    "wood-blank": 8,
    "lettering-finish": 6,
    "setup-and-labour": 22,
  },
};

/** Demo selling price used in hero overlay / costing demo. */
export const EXEMPLAR_DEMO_PRICE: Record<string, number> = {
  candles: 18,
  cookies: 12,
  crochet: 48,
  "3d-printed-products": 28,
  pottery: 65,
  "wooden-signs": 55,
};

export const EXEMPLAR_STORE_LABEL: Record<string, string> = {
  candles: "Ember & Earth (demo)",
  cookies: "Oven & Batch (demo)",
  crochet: "Loop & Fibre (demo)",
  "3d-printed-products": "Print & Form (demo)",
  pottery: "Kiln House Studio (demo)",
  "wooden-signs": "Letter & Grain (demo)",
};

export function isExemplar(slug: string): boolean {
  return slug in EXEMPLAR_BATCH_VALUES;
}

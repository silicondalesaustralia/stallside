/** Canonical food-production measure units (Phase 6). */

export const MEASURE_UNITS = ["MG", "G", "KG", "ML", "L", "EACH"] as const;
export type MeasureUnitCode = (typeof MEASURE_UNITS)[number];

export type MeasureFamily = "weight" | "volume" | "count";

const FAMILY: Record<MeasureUnitCode, MeasureFamily> = {
  MG: "weight",
  G: "weight",
  KG: "weight",
  ML: "volume",
  L: "volume",
  EACH: "count",
};

/** Factor to convert 1 unit into the family's base (G, ML, or EACH). */
const TO_BASE: Record<MeasureUnitCode, number> = {
  MG: 0.001,
  G: 1,
  KG: 1000,
  ML: 1,
  L: 1000,
  EACH: 1,
};

export function isMeasureUnit(value: string): value is MeasureUnitCode {
  return (MEASURE_UNITS as readonly string[]).includes(value);
}

export function measureFamily(unit: MeasureUnitCode): MeasureFamily {
  return FAMILY[unit];
}

export function unitsCompatible(a: MeasureUnitCode, b: MeasureUnitCode): boolean {
  return FAMILY[a] === FAMILY[b];
}

/**
 * Convert quantity between compatible units.
 * Uses floating math with 9dp intermediate precision; callers round for display.
 */
export function convertMeasure(
  quantity: number,
  from: MeasureUnitCode,
  to: MeasureUnitCode,
): number {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative finite number");
  }
  if (!unitsCompatible(from, to)) {
    throw new Error(`Cannot convert ${from} to ${to}`);
  }
  if (from === to) return quantity;
  const base = quantity * TO_BASE[from];
  return base / TO_BASE[to];
}

export function unitLabel(unit: MeasureUnitCode): string {
  switch (unit) {
    case "MG":
      return "mg";
    case "G":
      return "g";
    case "KG":
      return "kg";
    case "ML":
      return "ml";
    case "L":
      return "L";
    case "EACH":
      return "each";
  }
}

/** Prefer a human display unit for aggregated amounts. */
export function preferDisplayUnit(
  quantityInBase: number,
  family: MeasureFamily,
): { quantity: number; unit: MeasureUnitCode } {
  if (family === "count") {
    return { quantity: quantityInBase, unit: "EACH" };
  }
  if (family === "weight") {
    if (quantityInBase >= 1000) {
      return { quantity: quantityInBase / 1000, unit: "KG" };
    }
    if (quantityInBase < 1 && quantityInBase > 0) {
      return { quantity: quantityInBase * 1000, unit: "MG" };
    }
    return { quantity: quantityInBase, unit: "G" };
  }
  if (quantityInBase >= 1000) {
    return { quantity: quantityInBase / 1000, unit: "L" };
  }
  return { quantity: quantityInBase, unit: "ML" };
}

export function formatQuantity(quantity: number, maxDecimals = 3): string {
  if (!Number.isFinite(quantity)) return "—";
  const rounded =
    Math.round(quantity * 10 ** maxDecimals) / 10 ** maxDecimals;
  return String(rounded);
}

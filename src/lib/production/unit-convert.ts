export const MEASURE_UNITS = ["MG", "G", "KG", "ML", "L", "EACH"] as const;

export type Unit = (typeof MEASURE_UNITS)[number];

type Family = "mass" | "volume" | "count";

const UNIT_INFO: Record<Unit, { family: Family; factor: number; label: string }> = {
  MG: { family: "mass", factor: 0.001, label: "mg" },
  G: { family: "mass", factor: 1, label: "g" },
  KG: { family: "mass", factor: 1000, label: "kg" },
  ML: { family: "volume", factor: 1, label: "ml" },
  L: { family: "volume", factor: 1000, label: "L" },
  EACH: { family: "count", factor: 1, label: "each" },
};

export function isUnit(value: unknown): value is Unit {
  return typeof value === "string" && (MEASURE_UNITS as readonly string[]).includes(value);
}

export function unitLabel(unit: Unit): string {
  return UNIT_INFO[unit].label;
}

/** Units that can be converted to/from `unit` (same family). */
export function compatibleUnits(unit: Unit): Unit[] {
  const family = UNIT_INFO[unit].family;
  return MEASURE_UNITS.filter((u) => UNIT_INFO[u].family === family);
}

/** Converts between units of the same family; null when families differ. */
export function convertQuantity(quantity: number, from: Unit, to: Unit): number | null {
  const a = UNIT_INFO[from];
  const b = UNIT_INFO[to];
  if (a.family !== b.family) return null;
  return (quantity * a.factor) / b.factor;
}

export function formatQuantity(quantity: number, unit: Unit): string {
  const rounded = Math.round(quantity * 1000) / 1000;
  return `${rounded.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${unitLabel(unit)}`;
}

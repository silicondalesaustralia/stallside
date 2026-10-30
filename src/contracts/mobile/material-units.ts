import { z } from "zod";

export const MATERIAL_UNITS = ["MG", "G", "KG", "ML", "L", "EACH"] as const;
export const materialUnit = z.enum(MATERIAL_UNITS);
export type MaterialUnit = z.infer<typeof materialUnit>;

const FAMILY: Record<MaterialUnit, "mass" | "volume" | "count"> = {
  MG: "mass",
  G: "mass",
  KG: "mass",
  ML: "volume",
  L: "volume",
  EACH: "count",
};

const LABEL: Record<MaterialUnit, string> = { MG: "mg", G: "g", KG: "kg", ML: "ml", L: "L", EACH: "each" };

export function materialUnitLabel(unit: MaterialUnit): string {
  return LABEL[unit];
}

/** Units that convert to/from `unit` (weight, volume or count). */
export function compatibleMaterialUnits(unit: MaterialUnit): MaterialUnit[] {
  return MATERIAL_UNITS.filter((u) => FAMILY[u] === FAMILY[unit]);
}

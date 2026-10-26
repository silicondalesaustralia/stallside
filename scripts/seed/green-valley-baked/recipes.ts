import type { MeasureUnit } from "../../../src/generated/prisma/client";
import { MARK, type Db, type Scope } from "./context";
import type { MaterialKey, MaterialRef } from "./materials";

type Line = [MaterialKey, number, MeasureUnit];

const FOCACCIA_LINES: Line[] = [
  ["breadFlour", 3, "KG"],
  ["oliveOil", 300, "ML"],
  ["salt", 60, "G"],
  ["yeast", 30, "G"],
  ["rosemary", 50, "G"],
  ["saltFlakes", 40, "G"],
  ["breadBags", 10, "EACH"],
];

const COOKIE_LINES: Line[] = [
  ["plainFlour", 750, "G"],
  ["butter", 500, "G"],
  ["brownSugar", 400, "G"],
  ["casterSugar", 200, "G"],
  ["eggs", 3, "EACH"],
  ["chocChips", 500, "G"],
  ["vanilla", 10, "ML"],
  ["bicarb", 10, "G"],
  ["salt", 5, "G"],
  ["cookieBags", 6, "EACH"],
];

export type RecipeIds = { focaccia: string; cookies: string };

export async function seedRecipes(
  db: Db,
  { ownerId }: Scope,
  materials: Record<MaterialKey, MaterialRef>,
): Promise<RecipeIds> {
  const lines = (list: Line[]) =>
    list.map(([key, quantity, unit], i) => ({ ingredientId: materials[key].id, quantity, unit, sortOrder: i }));

  const focaccia = await db.recipe.create({
    data: {
      ownerId,
      name: "Rosemary & Sea Salt Focaccia",
      description: "Overnight-proved focaccia with fresh rosemary and flaky salt.",
      yieldQuantity: 10,
      yieldLabel: "loaves",
      instructions:
        "Mix flour, 2.4 L water, yeast and salt. Rest 30 min, fold, then cold-prove overnight. Pan with oil, dimple, top with rosemary and salt flakes. Bake 25 min at 230°C.",
      prepNotes: MARK,
      wastePercent: 5,
      labourMinutes: 60,
      labourRateCents: 3000,
      overheadCents: 400,
      lines: { create: lines(FOCACCIA_LINES) },
    },
    select: { id: true },
  });

  const cookies = await db.recipe.create({
    data: {
      ownerId,
      name: "Choc Chip Cookies",
      description: "Brown butter choc chip cookies, bagged in sixes.",
      yieldQuantity: 36,
      yieldLabel: "cookies",
      instructions:
        "Cream butter and sugars, beat in eggs and vanilla. Fold in flour, bicarb, salt and chips. Scoop 36, chill 1 hr, bake 11 min at 180°C. Bag in sixes once cool.",
      prepNotes: MARK,
      wastePercent: 3,
      labourMinutes: 45,
      labourRateCents: 3000,
      overheadCents: 300,
      lines: { create: lines(COOKIE_LINES) },
    },
    select: { id: true },
  });

  return { focaccia: focaccia.id, cookies: cookies.id };
}

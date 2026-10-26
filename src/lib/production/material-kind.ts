import type { MaterialKind } from "@/generated/prisma/client";

const PACKAGING_WORDS =
  /\b(bags?|box(es)?|cartons?|labels?|stickers?|jars?|lids?|bottles?|containers?|tubs?|punnets?|trays?|wraps?|cling|film|sleeves?|pouch(es)?|cups?|clamshells?|twist ties?|ribbons?|tape|tissue|mailers?)\b/i;

/** Best guess for a new material's type from its name; the owner can change it later. */
export function guessMaterialKind(name: string): MaterialKind {
  return PACKAGING_WORDS.test(name) ? "PACKAGING" : "INGREDIENT";
}

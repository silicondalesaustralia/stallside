import type { ImportRecord, PreparedRow } from "../types";

const NO_OPTION = new Set(["", "default title", "default", "regular"]);

export function hasOptionValues(rec: ImportRecord): boolean {
  return [rec.option1Value, rec.option2Value, rec.option3Value].some(
    (v) => !NO_OPTION.has((v ?? "").trim().toLowerCase()),
  );
}

/** Drops placeholder option values like Shopify's "Default Title". */
export function clearPlaceholderOptions(rec: ImportRecord): ImportRecord {
  if (hasOptionValues(rec)) return rec;
  return { ...rec, option1Name: "", option1Value: "", option2Name: "", option2Value: "", option3Name: "", option3Value: "" };
}

/** Default rule: group by handle (else name); rows with option values are variants. */
export function prepareGeneric(rec: ImportRecord): PreparedRow {
  const clean = clearPlaceholderOptions(rec);
  const group = (clean.handle || clean.name || "").trim().toLowerCase();
  return { rec: clean, kind: hasOptionValues(clean) ? "variant" : "product", group };
}

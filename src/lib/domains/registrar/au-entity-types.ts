/** .com.au / .net.au entity types accepted by Namecheap (auDA "eligibility type"). */
export const AU_ENTITY_TYPES = [
  "Sole Trader",
  "Partnership",
  "Company",
  "Trust",
  "Incorporated Association",
  "Trademark Owner",
  "Pending TM Owner",
] as const;

const TRADEMARK_TYPES = new Set<string>(["Trademark Owner", "Pending TM Owner"]);

/** Keep the entity type consistent with the ID type the registry checks it against. */
export function auEntityTypeFor(idType: string, chosen: string): string {
  if (idType === "ACN") return "Company";
  if (idType === "TM") return TRADEMARK_TYPES.has(chosen) ? chosen : "Trademark Owner";
  const valid = (AU_ENTITY_TYPES as readonly string[]).includes(chosen) && !TRADEMARK_TYPES.has(chosen);
  return valid ? chosen : "Sole Trader";
}

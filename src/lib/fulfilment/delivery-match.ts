import { DeliveryZoneRuleKind } from "@/generated/prisma/client";

type ZoneRule = { kind: DeliveryZoneRuleKind; value: string };

/** True when suburb or postcode matches at least one zone rule. */
export function deliveryAddressMatchesZone(
  rules: ZoneRule[],
  suburb: string,
  postcode: string,
): boolean {
  if (rules.length === 0) return false;
  const suburbU = suburb.trim().toUpperCase();
  const postcodeU = postcode.trim().toUpperCase();
  const postcodes = rules
    .filter((r) => r.kind === DeliveryZoneRuleKind.POSTCODE)
    .map((r) => r.value.toUpperCase());
  const suburbs = rules
    .filter((r) => r.kind === DeliveryZoneRuleKind.SUBURB)
    .map((r) => r.value.toUpperCase());
  if (postcodes.length > 0 && postcodes.includes(postcodeU)) return true;
  if (suburbs.length > 0 && suburbs.includes(suburbU)) return true;
  return false;
}

export function deliveryZoneMismatchMessage(): string {
  return "Sorry — we don't deliver to that suburb or postcode.";
}

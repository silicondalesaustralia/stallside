import { taxFromInclusiveCents, taxOnTopCents } from "@/lib/gst";
import type { TaxRule } from "./config";

export type ShippingTax = { addedCents: number; recordedCents: number };

/**
 * Tax on a delivery fee when the owner marks delivery taxable. `addedCents` goes on top of the
 * charge (US/CA); `recordedCents` is what joins the order's tax total.
 */
export function shippingTax(rule: TaxRule | null, taxShipping: boolean, shippingCents: number): ShippingTax {
  if (!rule || !taxShipping || shippingCents <= 0) return { addedCents: 0, recordedCents: 0 };
  if (rule.inclusive) {
    return { addedCents: 0, recordedCents: taxFromInclusiveCents(shippingCents, rule.rateBps) };
  }
  const added = taxOnTopCents(shippingCents, rule.rateBps);
  return { addedCents: added, recordedCents: added };
}

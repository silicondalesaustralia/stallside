import { isDemoStandSlug } from "@/lib/demo";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";

export type RestockOptInProps = {
  standId: string;
  prefillEmail?: string;
};

/** Starter and Pro both collect opt-ins; sending notify is Pro-gated elsewhere. */
export function restockOptInForOrder(
  order: {
    stand: { id: string; slug: string } | null;
    owner?: unknown;
  },
  paymentConfirmed: boolean,
  prefillEmail?: string | null,
): RestockOptInProps | null {
  if (!paymentConfirmed || !order.stand) return null;
  if (!isRestockAlertsEnabled()) return null;
  if (isDemoStandSlug(order.stand.slug)) return null;
  return {
    standId: order.stand.id,
    prefillEmail: prefillEmail?.trim() || undefined,
  };
}

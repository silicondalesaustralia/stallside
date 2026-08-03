import { isDemoStandSlug } from "@/lib/demo";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";

export type RestockOptInProps = {
  standId: string;
  prefillEmail?: string;
};

/** Free and Pro both collect opt-ins and can send restock notify emails. */
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

import { isDemoStandSlug } from "@/lib/demo";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";

export type RestockOptInProps = {
  standId: string;
  prefillEmail?: string;
};

export function restockOptInForOrder(
  order: {
    stand: { id: string; slug: string } | null;
    owner: {
      subscriptionPlan?: string | null;
      lifetimeAccess?: boolean | null;
      user?: { email: string | null; role: string | null } | null;
    };
  },
  paymentConfirmed: boolean,
  prefillEmail?: string | null,
): RestockOptInProps | null {
  if (!paymentConfirmed || !order.stand) return null;
  if (!isRestockAlertsEnabled()) return null;
  if (isDemoStandSlug(order.stand.slug)) return null;
  if (
    !ownerHasCardTierAccess(order.owner, {
      email: order.owner.user?.email,
      role: order.owner.user?.role,
      lifetimeAccess: order.owner.lifetimeAccess,
    })
  ) {
    return null;
  }
  return {
    standId: order.stand.id,
    prefillEmail: prefillEmail?.trim() || undefined,
  };
}

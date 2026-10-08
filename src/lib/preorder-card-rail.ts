import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { getSquareConnection } from "@/lib/square/connection";
import { hasSquareSubscriptionScopes } from "@/lib/square/scopes";
import { withSquarePaymentsReady, type OwnerPaymentReady } from "@/lib/stand-payment-brands";

export type PreOrderCardRail = {
  /** Stripe or Square can take card payments for pre-orders. */
  cardReady: boolean;
  /** Square checkout is on but the connection predates saved-card scopes. */
  squareNeedsReconnectForDeposits: boolean;
};

/** Which card rail pre-orders will use, for gating pre-order pages and menus. */
export async function loadPreOrderCardRail(
  owner: OwnerPaymentReady & { id: string },
): Promise<PreOrderCardRail> {
  const stripeReady = Boolean(owner.stripeAccountId && owner.stripeChargesEnabled);
  if (owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { cardReady: stripeReady, squareNeedsReconnectForDeposits: false };
  }
  try {
    const ready = await withSquarePaymentsReady(owner);
    if (!ready.squarePaymentsReady) {
      return { cardReady: stripeReady, squareNeedsReconnectForDeposits: false };
    }
    const conn = await getSquareConnection(owner.id);
    return {
      cardReady: true,
      squareNeedsReconnectForDeposits: !hasSquareSubscriptionScopes(conn?.scopes ?? []),
    };
  } catch (error) {
    console.error("Pre-order card rail check failed", owner.id, error);
    return { cardReady: stripeReady, squareNeedsReconnectForDeposits: false };
  }
}

export const SQUARE_DEPOSIT_RECONNECT_ERROR =
  "To take deposits with Square, reconnect Square in Settings → Square (it needs permission to save cards).";

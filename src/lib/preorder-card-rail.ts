import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  squareConnectionMatchesBilling,
  squareEligibleBillingCurrency,
} from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { hasSquareSubscriptionScopes } from "@/lib/square/scopes";
import type { OwnerPaymentReady } from "@/lib/stand-payment-brands";

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
    const conn =
      isSquareConnectEnabled() && squareEligibleBillingCurrency(owner.billingCurrency)
        ? await getSquareConnection(owner.id)
        : null;
    if (
      conn?.status !== "ACTIVE" ||
      !conn.paymentsEnabled ||
      !conn.primaryLocationId ||
      !squareConnectionMatchesBilling(conn, owner.billingCurrency)
    ) {
      return { cardReady: stripeReady, squareNeedsReconnectForDeposits: false };
    }
    return {
      cardReady: true,
      squareNeedsReconnectForDeposits: !hasSquareSubscriptionScopes(conn.scopes),
    };
  } catch (error) {
    console.error("Pre-order card rail check failed", owner.id, error);
    return { cardReady: stripeReady, squareNeedsReconnectForDeposits: false };
  }
}

export const SQUARE_DEPOSIT_RECONNECT_ERROR =
  "To take deposits with Square, reconnect Square in Settings → Square (it needs permission to save cards).";

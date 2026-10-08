import { HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import type { PreOrderCartMeta } from "@/lib/checkout";
import { assertDepositLiabilityOk } from "@/lib/deposit-order";
import { splitDepositBalance } from "@/lib/deposit-split";
import { hasSquareSubscriptionScopes } from "@/lib/square/scopes";

export type SquareShopperDetails = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryAddressLine1: string;
  deliverySuburb: string;
  deliveryPostcode: string;
  deliveryNotes: string | null;
};

export type SquarePreOrderPlan = {
  /** Goods amount charged now (deposit or full total). */
  chargeGoodsCents: number;
  deposit: { depositCents: number; balanceCents: number; balanceDueAt: Date } | null;
  delivery: Pick<
    SquareShopperDetails,
    "deliveryAddressLine1" | "deliverySuburb" | "deliveryPostcode" | "deliveryNotes"
  > | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanShopperDetails(input: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddressLine1?: string;
  deliverySuburb?: string;
  deliveryPostcode?: string;
  deliveryNotes?: string;
}): SquareShopperDetails {
  return {
    customerName: (input.customerName ?? "").trim().slice(0, 120),
    customerEmail: (input.customerEmail ?? "").trim().toLowerCase().slice(0, 200),
    customerPhone: (input.customerPhone ?? "").trim().slice(0, 40) || null,
    deliveryAddressLine1: (input.deliveryAddressLine1 ?? "").trim().slice(0, 200),
    deliverySuburb: (input.deliverySuburb ?? "").trim().slice(0, 100),
    deliveryPostcode: (input.deliveryPostcode ?? "").trim().slice(0, 20),
    deliveryNotes: (input.deliveryNotes ?? "").trim().slice(0, 200) || null,
  };
}

/** Same checks as Stripe pre-order checkout, plus the saved-card scopes deposits need. */
export async function planSquarePreOrder(input: {
  preOrderCart: PreOrderCartMeta;
  shopper: SquareShopperDetails;
  totalCents: number;
  ownerId: string;
  grantedScopes: readonly string[];
}): Promise<SquarePreOrderPlan | { error: string }> {
  const { preOrderCart: cart, shopper } = input;
  const deliver = cart.handoverMode === HandoverMode.DELIVER;
  if (!shopper.customerName) {
    return { error: deliver ? "Enter your name for delivery." : "Enter your name for collection." };
  }
  if (!EMAIL_RE.test(shopper.customerEmail)) {
    return { error: "Enter a valid email for order details." };
  }
  if (
    deliver &&
    (!shopper.deliveryAddressLine1 || !shopper.deliverySuburb || !shopper.deliveryPostcode)
  ) {
    return { error: "Enter a delivery address." };
  }
  const delivery = deliver
    ? {
        deliveryAddressLine1: shopper.deliveryAddressLine1,
        deliverySuburb: shopper.deliverySuburb,
        deliveryPostcode: shopper.deliveryPostcode,
        deliveryNotes: shopper.deliveryNotes,
      }
    : null;

  if (cart.paymentTiming !== PaymentTiming.DEPOSIT_THEN_BALANCE) {
    return { chargeGoodsCents: input.totalCents, deposit: null, delivery };
  }
  if (!hasSquareSubscriptionScopes(input.grantedScopes)) {
    return { error: "This shop can't take deposits by card right now. Contact the business owner." };
  }
  const split = splitDepositBalance(input.totalCents, cart.depositPercent ?? 30);
  const liability = await assertDepositLiabilityOk(input.ownerId, split.depositCents);
  if (!liability.ok) return { error: liability.error };
  return {
    chargeGoodsCents: split.depositCents,
    deposit: { ...split, balanceDueAt: cart.collectionAt },
    delivery,
  };
}

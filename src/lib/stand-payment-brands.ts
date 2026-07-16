import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

type StandPaymentFlags = {
  currency: string;
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  acceptCard: boolean;
  acceptPayPal: boolean;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
};

type OwnerPaymentReady = {
  subscriptionPlan?: string | null;
  stripeAccountId?: string | null;
  stripeChargesEnabled?: boolean;
  paypalMerchantId?: string | null;
  paypalOnboardingComplete?: boolean;
  paypalPaymentsEnabled?: boolean;
  user?: { email?: string | null; role?: string | null } | null;
};

/** Brands to show on QR signs / checkout based on what’s actually offerable. */
export function standPaymentBrands(
  stand: StandPaymentFlags,
  owner: OwnerPaymentReady,
): PaymentBrand[] {
  const brands: PaymentBrand[] = [];

  if (stand.acceptCash) brands.push("cash");

  const method = localTransferForCurrency(stand.currency);
  const alias = stand.localTransferAlias?.trim() ?? "";
  if (
    stand.acceptLocalTransfer &&
    method &&
    alias &&
    stand.localTransferMethodId === method.id
  ) {
    brands.push("payid");
  }

  const cardReady = Boolean(
    stand.acceptCard &&
      ownerHasCardTierAccess(owner, {
        email: owner.user?.email,
        role: owner.user?.role,
      }) &&
      owner.stripeAccountId &&
      owner.stripeChargesEnabled,
  );
  if (cardReady) {
    brands.push("card", "apple", "google");
  }

  const paypalReady = Boolean(
    stand.acceptPayPal &&
      owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled &&
      process.env.PAYPAL_CLIENT_ID,
  );
  if (paypalReady) brands.push("paypal");

  return brands;
}

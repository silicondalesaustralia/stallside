import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import type { DemoRegion } from "@/lib/demo";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { isDemoCardReady } from "@/lib/stripe-demo";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";

type StandPaymentFlags = {
  slug?: string;
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

  if (standOffersCard(stand, owner)) {
    brands.push("card", "apple", "google");
  }

  if (standOffersPayPal(stand, owner)) {
    brands.push("paypal");
  }

  return brands;
}

/** PayPal at checkout — off until Connect is enabled for this environment. */
export function standOffersPayPal(
  stand: Pick<StandPaymentFlags, "acceptPayPal">,
  owner: OwnerPaymentReady,
): boolean {
  if (!stand.acceptPayPal || !isPayPalConnectAvailable()) return false;
  return Boolean(
    owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled &&
      process.env.PAYPAL_CLIENT_ID,
  );
}

/** Card / Tap & Go available for this stand (includes demo test-Stripe path). */
export function standOffersCard(
  stand: Pick<StandPaymentFlags, "slug" | "acceptCard">,
  owner: OwnerPaymentReady,
): boolean {
  if (!stand.acceptCard) return false;
  if (
    !ownerHasCardTierAccess(owner, {
      email: owner.user?.email,
      role: owner.user?.role,
    })
  ) {
    return false;
  }
  if (stand.slug && isDemoCardReady(stand.slug, owner)) return true;
  return Boolean(owner.stripeAccountId && owner.stripeChargesEnabled);
}

/**
 * Brands for the public /demo QR sign.
 * Cash + PayID (AU) + Card only — wallets need a real device/account and aren’t demoable.
 */
export function demoSignPaymentBrands(
  stand: StandPaymentFlags & { slug: string },
  _owner: OwnerPaymentReady,
  region?: DemoRegion | null,
): PaymentBrand[] {
  const brands: PaymentBrand[] = ["cash"];
  const aud =
    region === "au" || stand.currency.trim().toUpperCase() === "AUD";
  if (aud) brands.push("payid");
  brands.push("card");
  return brands;
}

import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import {
  paypalCheckoutBrandsForCurrency,
  stripeCheckoutBrandsForCurrency,
} from "@/lib/payment-brand-assets";
import { isDemoCardReady } from "@/lib/stripe-demo";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { isSquarePaymentsEnabled } from "@/lib/square/config";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";

type StandPaymentFlags = {
  slug?: string;
  currency: string;
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  acceptCard: boolean;
  acceptPayPal: boolean;
  acceptSquare?: boolean;
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
  onlinePaymentProvider?: OnlinePaymentProvider | string | null;
  billingCurrency?: string | null;
  squarePaymentsReady?: boolean;
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

  if (standOffersSquare(stand, owner)) {
    brands.push("square");
  } else if (standOffersCard(stand, owner)) {
    brands.push(...stripeCheckoutBrandsForCurrency(stand.currency));
  }

  if (standOffersPayPal(stand, owner)) {
    brands.push(...paypalCheckoutBrandsForCurrency(stand.currency));
  }

  return brands;
}

/** PayPal at checkout - off until Connect is enabled for this environment. */
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
  stand: Pick<StandPaymentFlags, "slug" | "acceptCard" | "acceptSquare">,
  owner: OwnerPaymentReady,
): boolean {
  if (standOffersSquare(stand, owner)) return false;
  if (!stand.acceptCard) return false;
  if (stand.slug && isDemoCardReady(stand.slug, owner)) return true;
  return Boolean(owner.stripeAccountId && owner.stripeChargesEnabled);
}

/** Square Web Payments when seller prefers Square and connection is healthy. */
export function standOffersSquare(
  stand: Pick<StandPaymentFlags, "acceptSquare">,
  owner: OwnerPaymentReady,
): boolean {
  if (!isSquarePaymentsEnabled()) return false;
  if (!squareEligibleBillingCurrency(owner.billingCurrency)) return false;
  if (!(stand.acceptSquare ?? false)) return false;
  if (owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) return false;
  return Boolean(owner.squarePaymentsReady);
}

/**
 * Brands for the public /demo QR sign.
 * Cash + PayID (AUD) + Card only - wallets need a real device/account and aren’t demoable.
 */
export function demoSignPaymentBrands(
  stand: StandPaymentFlags & { slug: string },
  _owner: OwnerPaymentReady,
): PaymentBrand[] {
  const brands: PaymentBrand[] = ["cash"];
  const aud = stand.currency.trim().toUpperCase() === "AUD";
  if (aud) brands.push("payid");
  brands.push(
    ...stripeCheckoutBrandsForCurrency(aud ? "AUD" : stand.currency),
  );
  return brands;
}

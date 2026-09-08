import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { summarizeStripeRequirements } from "@/lib/stripe-requirements-summary";
import {
  DEFAULT_NEVER_STARTED_STEPS,
  DEFAULT_STRIPE_SETUP_STEPS,
} from "@/lib/stripe-setup-steps";
import { productDashboardWhere } from "@/lib/product-visibility";
import {
  squareEligibleBillingCurrency,
  squareSettingsVisible,
} from "@/lib/commerce/payment-rail";
import { CommerceProvider } from "@/generated/prisma/client";

export type PaymentSetupBanner = {
  mode: "never-started" | "restricted";
  title: string;
  body: string;
  steps: string[];
  ctaLabel: string;
  ctaHref: string;
  /** Second CTA for AU (Square). */
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

/** @deprecated Use PaymentSetupBanner */
export type StripeSetupBanner = PaymentSetupBanner;

export const PAYMENTS_SETTINGS_HREF = "/dashboard/settings/payments";
export const STRIPE_SETTINGS_HREF = "/dashboard/settings/stripe";
export const SQUARE_SETTINGS_HREF = "/dashboard/settings/square";

export async function loadStripeSetupBanner(input: {
  ownerId: string;
  businessCount: number;
  selectedStandId: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  billingCurrency?: string | null;
}): Promise<PaymentSetupBanner | null> {
  const audSquare = squareSettingsVisible(input.billingCurrency);

  let squarePaymentsReady = false;
  if (audSquare) {
    const conn = await prisma.externalCommerceConnection.findUnique({
      where: {
        ownerId_provider: {
          ownerId: input.ownerId,
          provider: CommerceProvider.SQUARE,
        },
      },
      select: { status: true, paymentsEnabled: true },
    });
    squarePaymentsReady =
      conn?.status === "ACTIVE" && Boolean(conn.paymentsEnabled);
  }

  const cardRailReady =
    input.stripeChargesEnabled ||
    (squareEligibleBillingCurrency(input.billingCurrency) &&
      squarePaymentsReady);

  if (cardRailReady || input.businessCount === 0) {
    return null;
  }

  // Mid Stripe onboarding — keep Stripe-specific urgency
  if (input.stripeAccountId && !input.stripeChargesEnabled) {
    let steps: string[] = [...DEFAULT_STRIPE_SETUP_STEPS];
    if (isStripeConfigured()) {
      try {
        const account = await getStripe().accounts.retrieve(
          input.stripeAccountId,
        );
        const fromStripe = summarizeStripeRequirements(account);
        if (fromStripe.length > 0) steps = fromStripe;
      } catch (error) {
        console.error("Stripe setup banner requirements fetch failed", error);
      }
    }

    return {
      mode: "restricted",
      title: "Finish Stripe setup",
      body: "Card payments and payouts are paused until Stripe has everything they need.",
      steps,
      ctaLabel: "Continue Stripe setup",
      ctaHref: STRIPE_SETTINGS_HREF,
    };
  }

  let productCount = 0;
  if (input.selectedStandId) {
    productCount = await prisma.product.count({
      where: {
        ownerId: input.ownerId,
        standId: input.selectedStandId,
        ...productDashboardWhere,
      },
    });
  }
  if (productCount === 0) return null;

  if (audSquare) {
    return {
      mode: "never-started",
      title: "Connect Stripe or Square to take card payments",
      body: "Optional for cash and local bank transfer. Required for pre-orders and subscription boxes. Pick one online card provider.",
      steps: [
        "Open Payments and connect Stripe or Square",
        "Choose your live online card provider",
        "Share your shop or QR link",
      ],
      ctaLabel: "Connect Stripe",
      ctaHref: STRIPE_SETTINGS_HREF,
      secondaryCtaLabel: "Connect Square",
      secondaryCtaHref: SQUARE_SETTINGS_HREF,
    };
  }

  return {
    mode: "never-started",
    title: "Connect Stripe to take card payments",
    body: "Optional for cash and local bank transfer. Required for pre-orders and subscription boxes.",
    steps: [...DEFAULT_NEVER_STARTED_STEPS],
    ctaLabel: "Connect Stripe",
    ctaHref: STRIPE_SETTINGS_HREF,
  };
}

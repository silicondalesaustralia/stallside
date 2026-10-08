import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { summarizeStripeRequirements } from "@/lib/stripe-requirements-summary";
import {
  DEFAULT_NEVER_STARTED_STEPS,
  DEFAULT_STRIPE_SETUP_STEPS,
} from "@/lib/stripe-setup-steps";
import { productDashboardWhere } from "@/lib/product-visibility";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";

export type StripeSetupBanner = {
  mode: "never-started" | "restricted";
  title: string;
  body: string;
  steps: string[];
  ctas: { label: string; href: string }[];
  helpHref: string | null;
};

const STRIPE_SETTINGS_HREF = "/dashboard/settings/stripe";
const SQUARE_SETTINGS_HREF = "/dashboard/settings/square";
const CHOOSE_PROVIDER_HREF = "/dashboard/knowledge/payments-overview";

async function squareStatus(ownerId: string, billingCurrency: string | null) {
  if (!isSquareConnectEnabled() || !squareEligibleBillingCurrency(billingCurrency)) {
    return { available: false, connected: false };
  }
  try {
    const conn = await getSquareConnection(ownerId);
    return { available: true, connected: conn?.status === "ACTIVE" };
  } catch (error) {
    console.error("Setup banner Square lookup failed", error);
    return { available: true, connected: false };
  }
}

export async function loadStripeSetupBanner(input: {
  ownerId: string;
  businessCount: number;
  selectedStandId: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  billingCurrency: string | null;
}): Promise<StripeSetupBanner | null> {
  if (input.stripeChargesEnabled || input.businessCount === 0) {
    return null;
  }
  const square = await squareStatus(input.ownerId, input.billingCurrency);
  if (square.connected) return null;

  if (input.stripeAccountId) {
    let steps: string[] = [...DEFAULT_STRIPE_SETUP_STEPS];
    if (isStripeConfigured()) {
      try {
        const account = await getStripe().accounts.retrieve(input.stripeAccountId);
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
      ctas: [{ label: "Continue Stripe setup", href: STRIPE_SETTINGS_HREF }],
      helpHref: null,
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

  if (square.available) {
    return {
      mode: "never-started",
      title: "Connect Stripe or Square to take card payments",
      body: "Optional if you only take cash or bank transfer. Pick the one that suits how you sell. You can connect both.",
      steps: [
        "Stripe: cards, Apple Pay / Google Pay and pay-later",
        "Square: cards plus stock sync with your Square reader at markets",
        "Both handle pre-orders, deposits, subscriptions and memberships",
        "Then turn on card payments on your checkout",
      ],
      ctas: [
        { label: "Connect Stripe", href: STRIPE_SETTINGS_HREF },
        { label: "Connect Square", href: SQUARE_SETTINGS_HREF },
      ],
      helpHref: CHOOSE_PROVIDER_HREF,
    };
  }

  return {
    mode: "never-started",
    title: "Connect Stripe to take card payments",
    body: "Optional for cash and local bank transfer. Required for pre-orders and subscription boxes.",
    steps: [...DEFAULT_NEVER_STARTED_STEPS],
    ctas: [{ label: "Connect Stripe", href: STRIPE_SETTINGS_HREF }],
    helpHref: null,
  };
}

export { STRIPE_SETTINGS_HREF };

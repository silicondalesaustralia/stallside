import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { summarizeStripeRequirements } from "@/lib/stripe-requirements-summary";
import {
  DEFAULT_NEVER_STARTED_STEPS,
  DEFAULT_STRIPE_SETUP_STEPS,
} from "@/lib/stripe-setup-steps";
import { productDashboardWhere } from "@/lib/product-visibility";

export type StripeSetupBanner = {
  mode: "never-started" | "restricted";
  title: string;
  body: string;
  steps: string[];
  ctaLabel: string;
};

const STRIPE_SETTINGS_HREF = "/dashboard/settings/stripe";

export async function loadStripeSetupBanner(input: {
  ownerId: string;
  businessCount: number;
  selectedStandId: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
}): Promise<StripeSetupBanner | null> {
  if (input.stripeChargesEnabled || input.businessCount === 0) {
    return null;
  }

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
      ctaLabel: "Continue Stripe setup",
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

  return {
    mode: "never-started",
    title: "Connect Stripe to take card payments",
    body: "Optional for cash and local bank transfer. Required for pre-orders and subscription boxes.",
    steps: [...DEFAULT_NEVER_STARTED_STEPS],
    ctaLabel: "Connect Stripe",
  };
}

export { STRIPE_SETTINGS_HREF };

import type Stripe from "stripe";
import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  cardPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELLED;
    default:
      return SubscriptionStatus.NONE;
  }
}

export function billingFromSubscription(subscription: Stripe.Subscription): {
  currency: BillingCurrency;
  monthlyFeeCents: number;
} {
  const item = subscription.items.data[0];
  const raw = (item?.price.currency ?? "aud").toUpperCase();
  const currency: BillingCurrency = isBillingCurrency(raw) ? raw : "AUD";
  const monthlyFeeCents =
    typeof item?.price.unit_amount === "number"
      ? item.price.unit_amount
      : cardPlanCents(currency);
  return { currency, monthlyFeeCents };
}

export function periodEndFromSubscription(
  subscription: Stripe.Subscription,
): Date | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  const itemEnd = subscription.items.data[0]?.current_period_end;
  if (typeof itemEnd === "number") {
    return new Date(itemEnd * 1000);
  }
  return null;
}

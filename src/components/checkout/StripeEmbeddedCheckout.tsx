"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout as EmbeddedCheckout } from "@stripe/stripe-js";
import SectionCopy from "@/components/studio/SectionCopy";
import type { EmbeddedCheckoutInfo } from "@/lib/stripe-embedded-checkout";
import { CHECKOUT_COPY } from "@/lib/storefront/checkout-copy";

/**
 * Stripe Checkout inside the page. Card details stay in Stripe's secure frame; on payment
 * Stripe sends the shopper to the session's return URL (the website thank-you page).
 */
export default function StripeEmbeddedCheckout({
  checkout,
  onBack,
  backLabel,
}: {
  checkout: EmbeddedCheckoutInfo;
  onBack: () => void;
  backLabel?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { clientSecret, publishableKey, stripeAccountId } = checkout;

  useEffect(() => {
    let instance: EmbeddedCheckout | null = null;
    let cancelled = false;
    (async () => {
      try {
        const stripe = await loadStripe(publishableKey, { stripeAccount: stripeAccountId });
        if (!stripe) throw new Error("Stripe.js did not load");
        const page = await stripe.createEmbeddedCheckoutPage({ clientSecret });
        if (cancelled || !host.current) {
          page.destroy();
          return;
        }
        instance = page;
        page.mount(host.current);
      } catch (err) {
        console.error("[stripe-embedded-checkout] could not show checkout", err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [clientSecret, publishableKey, stripeAccountId]);

  return (
    <div className="flex flex-col gap-3">
      {failed ? (
        <p className="text-lg text-[var(--gone)]">
          Card checkout couldn&apos;t load. Check your connection and try again.
        </p>
      ) : null}
      <div ref={host} className="min-h-[24rem] overflow-hidden rounded-[var(--radius)] bg-white" />
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        {backLabel ?? <SectionCopy k="backFromCard" fallback={CHECKOUT_COPY.backFromCard} />}
      </button>
    </div>
  );
}

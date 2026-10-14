/** What the browser needs to show Stripe Checkout inside the page (the seller's connected account). */
export type EmbeddedCheckoutInfo = {
  clientSecret: string;
  publishableKey: string;
  stripeAccountId: string;
};

/**
 * Checkout Session display params: embedded in the page when a browser key is available,
 * else Stripe's hosted page. Embedded sessions have no cancel URL (the shopper just goes back).
 */
export function checkoutUiParams(publishableKey: string | null, successUrl: string, cancelUrl: string) {
  const returnTo = `${successUrl}?session_id={CHECKOUT_SESSION_ID}`;
  return publishableKey
    ? { ui_mode: "embedded_page" as const, return_url: returnTo }
    : { success_url: returnTo, cancel_url: cancelUrl };
}

/** Map PayPal order-create failures to owner/shopper-safe messages. */
export function paypalCheckoutUserError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("target_client_id")) {
    return "This PayPal seller account is not linked to Vendl marketplace. In Settings → PayPal, disconnect, then paste your Test Store seller merchant ID or complete marketplace Connect.";
  }
  if (msg.includes("INVALID_PLATFORM_FEES")) {
    return "PayPal rejected the platform fee for this seller. Re-connect PayPal (marketplace) for this business.";
  }
  if (msg.includes("PayPal /v2/checkout/orders")) {
    return "PayPal rejected checkout. Check seller Connect and platform fee setup.";
  }
  return "Could not start PayPal checkout.";
}

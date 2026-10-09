/** JWT for PayPal-Auth-Assertion (marketplace calls on behalf of a seller). */
export function paypalAuthAssertion(sellerMerchantId: string): string {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID is not set");
  }
  const merchantId = sellerMerchantId.trim();
  if (!merchantId) {
    throw new Error("Seller merchant id is required for PayPal auth assertion");
  }

  // PayPal samples use standard base64 (btoa), not base64url.
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64");

  const header = encode({ alg: "none" });
  const payload = encode({ iss: clientId, payer_id: merchantId });
  return `${header}.${payload}.`;
}

/**
 * Verify sandbox PayPal Platform app can call Partner Referrals.
 * Run after creating a Platform REST app and updating .env:
 *   npx tsx scripts/test-paypal-marketplace.ts
 */
import dotenv from "dotenv";
dotenv.config({ override: true });

const apiBase =
  (process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function main() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const partnerId = process.env.PAYPAL_PARTNER_MERCHANT_ID?.trim();
  const direct = (process.env.PAYPAL_CONNECT_MODE || "").toLowerCase() === "direct";

  if (!clientId || !secret || !partnerId) {
    console.error("Missing PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, or PAYPAL_PARTNER_MERCHANT_ID");
    process.exit(1);
  }
  if (direct) {
    console.warn("PAYPAL_CONNECT_MODE=direct — marketplace Partner Referrals will not be used in app.");
  }

  const tokenRes = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenBody = await tokenRes.text();
  if (!tokenRes.ok) {
    console.error("Token failed:", tokenRes.status, tokenBody);
    process.exit(1);
  }
  const { access_token: token } = JSON.parse(tokenBody) as { access_token: string };
  console.log("✓ OAuth token OK");

  const referralBody = {
    tracking_id: `vendl-verify-${Date.now()}`,
    operations: [
      {
        operation: "API_INTEGRATION",
        api_integration_preference: {
          rest_api_integration: {
            integration_method: "PAYPAL",
            integration_type: "THIRD_PARTY",
            third_party_details: {
              features: ["PAYMENT", "REFUND", "PARTNER_FEE"],
            },
          },
        },
      },
    ],
    products: ["EXPRESS_CHECKOUT"],
    legal_consents: [{ type: "SHARE_DATA_CONSENT", granted: true }],
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const bn = process.env.PAYPAL_BN_CODE?.trim();
  if (bn) headers["PayPal-Partner-Attribution-Id"] = bn;

  const refRes = await fetch(`${apiBase}/v2/customer/partner-referrals`, {
    method: "POST",
    headers,
    body: JSON.stringify(referralBody),
  });
  const refBody = await refRes.text();
  const debugId = refRes.headers.get("paypal-debug-id") ?? "(none)";

  if (!refRes.ok) {
    console.error(`✗ Partner Referrals failed: HTTP ${refRes.status}`);
    console.error("  debug_id:", debugId);
    console.error("  body:", refBody);
    console.error("");
    console.error("Fix: PayPal Developer → Create App → Type Platform (not Merchant).");
    console.error("     Enable Platform Fee on Sandbox App Settings.");
    console.error("     Use that app's Client ID/Secret + Platform Partner App merchant id.");
    process.exit(1);
  }

  const data = JSON.parse(refBody) as { links?: { rel: string; href: string }[] };
  const actionUrl = data.links?.find((l) => l.rel === "action_url")?.href;
  console.log("✓ Partner Referrals OK");
  console.log("  debug_id:", debugId);
  console.log("  onboarding URL:", actionUrl ?? "(missing — check response)");

  const statusRes = await fetch(
    `${apiBase}/v1/customer/partners/${partnerId}/merchant-integrations?tracking_id=nonexistent`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (statusRes.status === 403) {
    console.warn("⚠ Partner merchant-status API returned 403 — check PAYPAL_PARTNER_MERCHANT_ID");
  } else {
    console.log("✓ Partner merchant-integrations API reachable");
  }

  console.log("\nMarketplace env looks good. Restart dev server and Connect PayPal in settings.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

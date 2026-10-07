import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { suggestCatalogMatches } from "@/lib/square/catalog";
import { verifySquareWebhookSignature } from "@/lib/square/webhook-verify";
import { encryptSecret, decryptSecret } from "@/lib/square/crypto";
import { resolveOnlinePaymentRail } from "@/lib/commerce/payment-rail";
import { OnlinePaymentProvider } from "@/generated/prisma/client";

describe("square catalog matching", () => {
  it("matches exact SKU and never invents fuzzy links", () => {
    const suggestions = suggestCatalogMatches(
      [
        { id: "p1", name: "Eggs", sku: "EGG-12", upc: null },
        { id: "p2", name: "Honey", sku: null, upc: "123" },
      ],
      [
        {
          id: "sq-item-1",
          item_data: {
            name: "Farm Eggs",
            variations: [
              {
                id: "var-1",
                item_variation_data: { name: "Dozen", sku: "EGG-12" },
              },
            ],
          },
        },
        {
          id: "sq-item-2",
          item_data: {
            name: "Almost Eggs",
            variations: [
              {
                id: "var-2",
                item_variation_data: { name: "Close", sku: "EGG-99" },
              },
            ],
          },
        },
      ],
    );
    assert.equal(suggestions.length, 1);
    assert.equal(suggestions[0]?.confidence, "exact_sku");
    assert.equal(suggestions[0]?.productId, "p1");
  });

  it("matches item name alone only when the item has a single variation", () => {
    const products = [{ id: "p1", name: "Sourdough", sku: null, upc: null }];
    const single = suggestCatalogMatches(products, [
      {
        id: "i1",
        item_data: {
          name: "Sourdough",
          variations: [{ id: "v1", item_variation_data: { name: "Regular" } }],
        },
      },
    ]);
    assert.equal(single.length, 1);
    assert.equal(single[0]?.confidence, "exact_name");

    const multi = suggestCatalogMatches(products, [
      {
        id: "i2",
        item_data: {
          name: "Sourdough",
          variations: [
            { id: "v2", item_variation_data: { name: "Small" } },
            { id: "v3", item_variation_data: { name: "Large" } },
          ],
        },
      },
    ]);
    assert.equal(multi.length, 0);
  });
});

describe("square token crypto", () => {
  it("round-trips secrets", () => {
    const enc = encryptSecret("sq0at-test-token");
    assert.notEqual(enc, "sq0at-test-token");
    assert.equal(decryptSecret(enc), "sq0at-test-token");
  });
});

describe("square webhook signature", () => {
  it("rejects missing signature key", () => {
    assert.equal(
      verifySquareWebhookSignature({
        body: "{}",
        signatureHeader: "abc",
        notificationUrl: "https://vendl.app/api/square/webhook",
      }),
      false,
    );
  });
});

describe("online payment rail", () => {
  it("prefers Square when healthy and selected for AUD", () => {
    process.env.SQUARE_INTEGRATION_ENABLED = "1";
    process.env.SQUARE_PAYMENTS_ENABLED = "1";
    process.env.SQUARE_APPLICATION_ID = "sandbox-sq0id";
    process.env.SQUARE_APPLICATION_SECRET = "secret";
    assert.equal(
      resolveOnlinePaymentRail({
        preferred: OnlinePaymentProvider.SQUARE,
        stripeReady: true,
        squareReady: true,
        standAcceptSquare: true,
        billingCurrency: "AUD",
      }),
      "square",
    );
  });

  it("never uses Square for USD accounts", () => {
    process.env.SQUARE_INTEGRATION_ENABLED = "1";
    process.env.SQUARE_PAYMENTS_ENABLED = "1";
    process.env.SQUARE_APPLICATION_ID = "sandbox-sq0id";
    process.env.SQUARE_APPLICATION_SECRET = "secret";
    assert.equal(
      resolveOnlinePaymentRail({
        preferred: OnlinePaymentProvider.SQUARE,
        stripeReady: true,
        squareReady: true,
        standAcceptSquare: true,
        billingCurrency: "USD",
      }),
      "stripe",
    );
  });
});

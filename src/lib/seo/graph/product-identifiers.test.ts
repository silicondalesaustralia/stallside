import { test } from "node:test";
import assert from "node:assert/strict";
import type { PublicProductCard } from "@/lib/public-product";
import { gtinProperty, productNode } from "./product";

const product = {
  id: "p1",
  slug: "eggs",
  name: "Eggs",
  description: null,
  imageUrl: null,
  images: [],
  priceCents: 800,
  compareAtPriceCents: null,
  stockQuantity: 20,
  soldOut: false,
  isPreOrder: false,
  collectionAtMs: null,
} as unknown as PublicProductCard;

const node = (identifiers?: { sku?: string | null; barcode?: string | null }) =>
  productNode({
    product,
    pageUrl: "https://x.example/products/eggs",
    homeUrl: "https://x.example",
    brandName: "X",
    currency: "AUD",
    identifiers,
  });

test("gtin picks the property from the barcode length and checks the check digit", () => {
  assert.deepEqual(gtinProperty("036000291452"), { gtin12: "036000291452" });
  assert.deepEqual(gtinProperty("0 36000-29145 2"), { gtin12: "036000291452" });
  assert.deepEqual(gtinProperty("9300633603434"), { gtin13: "9300633603434" });
  assert.deepEqual(gtinProperty("036000291453"), {});
  assert.deepEqual(gtinProperty("12345"), {});
  assert.deepEqual(gtinProperty("ABC000291452"), {});
  assert.deepEqual(gtinProperty(null), {});
});

test("product uses its SKU and barcode, falling back to the id", () => {
  const withIds = node({ sku: " EGG-12 ", barcode: "036000291452" });
  assert.equal(withIds.sku, "EGG-12");
  assert.equal(withIds.gtin12, "036000291452");
  const without = node();
  assert.equal(without.sku, "p1");
  assert.equal("gtin12" in without, false);
});

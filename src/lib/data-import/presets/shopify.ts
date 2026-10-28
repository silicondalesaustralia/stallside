import type { ImportPreset, ImportRecord } from "../types";
import { firstOf } from "../parse-values";
import { hasOptionValues, prepareGeneric } from "./generic";

/** "gtin:0001234; upc:0123" → "0001234" (first barcode, type prefix dropped). */
function firstBarcode(raw: string | undefined): string {
  return firstOf(raw, /;/).replace(/^[a-z0-9_-]+:/i, "").trim();
}

/** Current export headers ("URL handle", "Price") with the legacy ones ("Handle", "Variant Price"). */
export const shopifyProducts: ImportPreset = {
  id: "shopify-products",
  platform: "Shopify",
  entity: "products",
  fingerprint: [/^(url )?handle$/, "title", /^(variant )?price$/, /^option1 value$/],
  columns: {
    handle: /^(url )?handle$/,
    name: "title",
    description: /^(description|body \(html\))$/,
    price: /^(variant )?price$/,
    compareAtPrice: /^(variant )?compare[- ]at price$/,
    cost: "cost per item",
    sku: /^(variant )?sku$/,
    barcode: /^(variant )?barcodes?$/,
    stock: /^(variant inventory qty|inventory quantity)$/,
    option1Name: "option1 name",
    option1Value: "option1 value",
    option2Name: "option2 name",
    option2Value: "option2 value",
    option3Name: "option3 name",
    option3Value: "option3 value",
    category: "type",
    imageUrl: /^(image src|product image url)$/,
    active: "status",
    taxable: /^(variant taxable|charge tax)$/,
  },
  prepare(raw) {
    const rec: ImportRecord = { ...raw, barcode: firstBarcode(raw.barcode) };
    const row = prepareGeneric(rec);
    // Extra image rows repeat the handle with no variant data.
    const imageOnly = !rec.name && !rec.price && !rec.sku && !hasOptionValues(rec);
    if (imageOnly) return { ...row, kind: "media" };
    return { ...row, group: (rec.handle ?? "").trim().toLowerCase() };
  },
  howToExport:
    "Shopify admin → Products → Export → All products → CSV for Excel, Numbers, or other spreadsheet programs.",
};

/** "All states" export: one row per variant per location. The "Available" layout needs manual mapping. */
export const shopifyInventory: ImportPreset = {
  id: "shopify-inventory",
  platform: "Shopify",
  entity: "inventory",
  fingerprint: ["handle", "location", /^available( \(not editable\))?$/],
  columns: {
    sku: "sku",
    name: "title",
    option1Value: /^option ?1 value$/,
    option2Value: /^option ?2 value$/,
    option3Value: /^option ?3 value$/,
    stock: /^available( \(not editable\))?$/,
  },
  sumRepeatedStock: true,
  howToExport:
    "Shopify admin → Products → Inventory → Export → All locations, All states, All variants → CSV.",
};

export const shopifyCustomers: ImportPreset = {
  id: "shopify-customers",
  platform: "Shopify",
  entity: "customers",
  fingerprint: ["first name", "last name", "email", /^accepts (email )?marketing$/],
  columns: {
    email: "email",
    firstName: "first name",
    lastName: "last name",
    phone: /^(phone|default address phone)$/,
    notes: "note",
    marketingConsent: /^accepts (email )?marketing$/,
  },
  howToExport: "Shopify admin → Customers → Export → All customers → CSV for Excel, Numbers, or other spreadsheet programs.",
};

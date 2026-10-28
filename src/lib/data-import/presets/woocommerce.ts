import type { ImportPreset, ImportRecord } from "../types";
import { firstOf } from "../parse-values";
import { clearPlaceholderOptions } from "./generic";

/** "Clothing > Shirts, Gifts" → "Shirts" (deepest level of the first category). */
function wooCategory(raw: string): string {
  const first = firstOf(raw, /,/);
  return first.split(">").map((s) => s.trim()).filter(Boolean).pop() ?? "";
}

function withSalePrice(rec: ImportRecord): ImportRecord {
  if (!rec.salePrice?.trim()) return rec;
  return { ...rec, compareAtPrice: rec.price, price: rec.salePrice };
}

export const wooProducts: ImportPreset = {
  id: "woocommerce-products",
  platform: "WooCommerce",
  entity: "products",
  fingerprint: ["id", "type", "sku", "regular price", "parent"],
  columns: {
    handle: "id",
    name: "name",
    description: "description",
    price: "regular price",
    salePrice: "sale price",
    sku: "sku",
    stock: "stock",
    option1Name: "attribute 1 name",
    option1Value: "attribute 1 value(s)",
    option2Name: "attribute 2 name",
    option2Value: "attribute 2 value(s)",
    option3Name: "attribute 3 name",
    option3Value: "attribute 3 value(s)",
    category: "categories",
    imageUrl: "images",
    active: "published",
    taxable: "tax status",
    parentRef: "parent",
    rowType: "type",
  },
  prepare(raw) {
    const rec = withSalePrice({
      ...raw,
      category: wooCategory(raw.category ?? ""),
      imageUrl: firstOf(raw.imageUrl, /,\s*/),
    });
    const type = (rec.rowType ?? "").trim().toLowerCase();
    const id = `id:${(rec.handle ?? "").trim()}`.toLowerCase();
    if (type === "variable") {
      return {
        rec: clearPlaceholderOptions({ ...rec, option1Value: "", option2Value: "", option3Value: "" }),
        kind: "parent",
        group: id,
        aliases: rec.sku ? [rec.sku.trim().toLowerCase()] : [],
      };
    }
    if (type === "variation") {
      const parent = (rec.parentRef ?? "").trim().toLowerCase();
      return { rec: { ...rec, name: "" }, kind: "variant", group: parent };
    }
    if (type === "simple" || type === "") {
      return { rec: clearPlaceholderOptions(rec), kind: "product", group: id };
    }
    return { rec, kind: "skip", group: id };
  },
  howToExport: "WordPress admin → Products → Export → Generate CSV (all columns, all product types).",
};

/** WooCommerce → Customers "Download" (Analytics report). Has no marketing consent column. */
export const wooCustomers: ImportPreset = {
  id: "woocommerce-customers",
  platform: "WooCommerce",
  entity: "customers",
  fingerprint: ["name", "username", "email", /^total spend/],
  columns: {
    email: "email",
    name: "name",
    phone: /^(billing|shipping) phone$/,
  },
  howToExport: "WordPress admin → WooCommerce → Customers → Download (exports the current view as CSV).",
};

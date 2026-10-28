import type { ImportPreset, ImportRecord } from "../types";
import { firstOf, slugLabel } from "../parse-values";
import { prepareGeneric } from "./generic";

/** Title, URL, description, categories, visibility and images sit on the first row of each product only. */
export const squarespaceProducts: ImportPreset = {
  id: "squarespace-products",
  platform: "Squarespace",
  entity: "products",
  fingerprint: ["product id [non editable]", "variant id [non editable]", "title"],
  columns: {
    handle: "product id [non editable]",
    productUrl: "product url",
    name: "title",
    description: "description",
    price: "price",
    salePrice: "sale price",
    onSale: "on sale",
    sku: "sku",
    barcode: "gtin",
    stock: "stock",
    option1Name: "option name 1",
    option1Value: "option value 1",
    option2Name: "option name 2",
    option2Value: "option value 2",
    option3Name: "option name 3",
    option3Value: "option value 3",
    category: "categories",
    imageUrl: /^hosted image urls?$/,
    active: "visible",
  },
  fillDown: ["handle", "productUrl"],
  prepare(raw) {
    const onSale = (raw.onSale ?? "").trim().toLowerCase() === "yes" && raw.salePrice?.trim();
    const rec: ImportRecord = {
      ...raw,
      ...(onSale ? { compareAtPrice: raw.price, price: raw.salePrice } : {}),
      category: slugLabel(firstOf(raw.category, /,/)),
      imageUrl: firstOf(raw.imageUrl, /\s+/),
    };
    const row = prepareGeneric(rec);
    return { ...row, group: (rec.handle || rec.productUrl || rec.name || "").trim().toLowerCase() };
  },
  howToExport: "Squarespace → Products panel → Export all (CSV).",
};

/** Customers list export. It has no marketing consent column, so nobody is opted in. */
export const squarespaceCustomers: ImportPreset = {
  id: "squarespace-customers",
  platform: "Squarespace",
  entity: "customers",
  fingerprint: ["first name", "last name", "email", "customer since"],
  columns: {
    email: "email",
    firstName: "first name",
    lastName: "last name",
    phone: /phone/,
  },
  howToExport: "Squarespace → Contacts → Lists & Segments → Customers → Export icon → Confirm.",
};

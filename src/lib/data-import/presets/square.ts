import type { ImportPreset } from "../types";
import { firstOf } from "../parse-values";
import { prepareGeneric } from "./generic";

export const squareItems: ImportPreset = {
  id: "square-items",
  platform: "Square",
  entity: "products",
  fingerprint: ["token", "item name", "variation name"],
  columns: {
    name: "item name",
    variationName: "variation name",
    description: "description",
    price: "price",
    cost: "default unit cost",
    sku: "sku",
    barcode: "gtin",
    stock: /^current quantity/,
    option1Name: "option name 1",
    option1Value: "option value 1",
    option2Name: "option name 2",
    option2Value: "option value 2",
    option3Name: "option name 3",
    option3Value: "option value 3",
    category: /^(categories|category|reporting category)$/,
    archived: "archived",
    visibility: "square online item visibility",
    taxable: /^tax - /,
  },
  prepare(raw) {
    const variation = (raw.variationName ?? "").trim();
    // Items without Square options still name each variation (e.g. "500g", "1kg").
    const rec =
      !raw.option1Name?.trim() && variation && variation.toLowerCase() !== "regular"
        ? { ...raw, option1Name: "Option", option1Value: variation }
        : raw;
    const archived = /^(y|yes)$/i.test((raw.archived ?? "").trim());
    const hidden = /^(hidden|unavailable)$/i.test((raw.visibility ?? "").trim());
    const row = prepareGeneric({
      ...rec,
      category: firstOf(rec.category, /,/),
      active: archived || hidden ? "no" : "yes",
    });
    return { ...row, group: (rec.name ?? "").trim().toLowerCase() };
  },
  howToExport:
    "Square Dashboard → Items & services → Item library → Actions → Export library → CSV. Stock is read from the first location's Current Quantity column.",
};

export const squareCustomers: ImportPreset = {
  id: "square-customers",
  platform: "Square",
  entity: "customers",
  fingerprint: ["first name", /^(surname|last name)$/, "email address", "phone number"],
  columns: {
    email: "email address",
    firstName: "first name",
    lastName: /^(surname|last name)$/,
    phone: "phone number",
    notes: "memo",
    marketingConsent: "email subscription status",
  },
  howToExport: "Square Dashboard → Customers → Directory → Import / Export → Export Customers → All Customers → Download.",
};

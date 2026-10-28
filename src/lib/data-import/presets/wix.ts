import type { ImportPreset, ImportRecord } from "../types";
import { firstOf, parseMoney } from "../parse-values";

const WIX_MEDIA = "https://static.wixstatic.com/media/";

/** First image as a full URL; exports often hold just the media file id ("abc~mv2.jpg"). */
export function wixImage(raw: string | undefined): string {
  const first = firstOf(raw, /;/);
  if (!first) return "";
  return /^https?:\/\//i.test(first) ? first : `${WIX_MEDIA}${first}`;
}

/** Product-level discount → sale price, with the original kept as compare-at. */
function withDiscount(rec: ImportRecord): ImportRecord {
  const price = parseMoney(rec.price);
  const off = Number((rec.discountValue ?? "").trim());
  const mode = (rec.discountMode ?? "").trim().toUpperCase();
  if (price === undefined || !Number.isFinite(off) || off <= 0) return rec;
  const cents = mode === "PERCENT" ? Math.round(price * (1 - off / 100)) : mode === "AMOUNT" ? price - Math.round(off * 100) : price;
  if (cents <= 0 || cents >= price) return rec;
  return { ...rec, compareAtPrice: rec.price, price: (cents / 100).toFixed(2) };
}

/** Classic Wix Stores export ("handleId", "productOptionDescription1"). */
export const wixProducts: ImportPreset = {
  id: "wix-products",
  platform: "Wix",
  entity: "products",
  fingerprint: ["handleid", "fieldtype", "name"],
  columns: {
    handle: "handleid",
    rowType: "fieldtype",
    name: "name",
    description: "description",
    price: "price",
    surcharge: "surcharge",
    cost: "cost",
    sku: "sku",
    stock: "inventory",
    option1Name: "productoptionname1",
    option1Value: "productoptiondescription1",
    option2Name: "productoptionname2",
    option2Value: "productoptiondescription2",
    option3Name: "productoptionname3",
    option3Value: "productoptiondescription3",
    category: "collection",
    imageUrl: "productimageurl",
    active: "visible",
    discountMode: "discountmode",
    discountValue: "discountvalue",
  },
  prepare(raw) {
    const group = (raw.handle ?? "").trim().toLowerCase();
    const isVariant = (raw.rowType ?? "").trim().toLowerCase() === "variant";
    const rec = {
      ...(isVariant ? raw : withDiscount(raw)),
      category: firstOf(raw.category, /;/),
      imageUrl: wixImage(raw.imageUrl),
    };
    if (!isVariant) {
      const listsOptions = Boolean(raw.option1Name?.trim());
      // Product rows list every choice ("S;M;L"); variants come on their own rows.
      return listsOptions
        ? { rec: { ...rec, option1Value: "", option2Value: "", option3Value: "" }, kind: "parent", group }
        : { rec, kind: "product", group };
    }
    // Variant price is blank (inherits the product price) plus any surcharge.
    return { rec: { ...rec, name: "" }, kind: "variant", group };
  },
  howToExport: "Wix dashboard → Store Products → Products → More Actions → Export (CSV).",
};

export const wixCustomers: ImportPreset = {
  id: "wix-customers",
  platform: "Wix",
  entity: "customers",
  fingerprint: ["email 1", "first name"],
  columns: {
    email: "email 1",
    firstName: "first name",
    lastName: "last name",
    phone: "phone 1",
    marketingConsent: "email subscriber status",
  },
  howToExport: "Wix dashboard → Contacts → Import / Export → Export → All Contacts → Regular CSV file.",
};

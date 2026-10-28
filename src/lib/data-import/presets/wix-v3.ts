import type { ImportPreset, ImportRecord, PreparedRow } from "../types";
import { firstOf, slugLabel } from "../parse-values";
import { wixImage } from "./wix";

const option = (kind: "name" | "choices", n: number) => new RegExp(`^productoption${kind}\\[?${n}\\]?$`);

/** Swatch choices export as "#FFFFFF:White". */
const choiceLabel = (raw: string | undefined) => (raw ?? "").replace(/^#[0-9a-f]{3,8}:/i, "").trim();

/** Current Wix Stores export: PRODUCT, VARIANT and MEDIA rows sharing a "handle". */
export const wixProductsV3: ImportPreset = {
  id: "wix-products-v3",
  platform: "Wix",
  entity: "products",
  fingerprint: ["handle", "fieldtype", "name", "price"],
  columns: {
    handle: "handle",
    rowType: "fieldtype",
    name: "name",
    description: /^(plaindescription|description)$/,
    category: "primarycategoryslug",
    categories: "categoryslugs",
    imageUrl: "media",
    price: "price",
    compareAtPrice: "strikethroughprice",
    cost: "cost",
    sku: "sku",
    barcode: "barcode",
    stock: "inventory",
    active: "visible",
    option1Name: option("name", 1),
    option1Value: option("choices", 1),
    option2Name: option("name", 2),
    option2Value: option("choices", 2),
    option3Name: option("name", 3),
    option3Value: option("choices", 3),
  },
  prepare(raw): PreparedRow {
    const group = (raw.handle ?? "").trim().toLowerCase();
    const type = (raw.rowType ?? "").trim().toUpperCase();
    if (type === "MEDIA") {
      return { rec: { imageUrl: wixImage(raw.imageUrl) }, kind: "media", group };
    }
    const rec: ImportRecord = {
      ...raw,
      category: slugLabel(raw.category || firstOf(raw.categories, /;/)),
      imageUrl: wixImage(raw.imageUrl),
      option1Value: choiceLabel(raw.option1Value),
      option2Value: choiceLabel(raw.option2Value),
      option3Value: choiceLabel(raw.option3Value),
    };
    if (type === "VARIANT") return { rec: { ...rec, name: "" }, kind: "variant", group };
    // Product rows list every choice ("S;M;L"); each sellable combination has its own VARIANT row.
    return {
      rec: { ...rec, option1Value: "", option2Value: "", option3Value: "" },
      kind: rec.option1Name?.trim() ? "parent" : "product",
      group,
    };
  },
  howToExport:
    "Wix dashboard → Store Products → More Actions → Import → Export Products (CSV). On the classic product page use More Actions → Export.",
};

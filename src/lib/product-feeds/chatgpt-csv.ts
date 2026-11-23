import { csvCell, feedMoney } from "./format";
import type { FeedCatalog, FeedItem } from "./types";

const HEADERS = [
  "item_id",
  "title",
  "description",
  "url",
  "brand",
  "seller_name",
  "seller_url",
  "image_url",
  "additional_image_urls",
  "availability",
  "price",
  "sale_price",
  "gtin",
  "mpn",
  "condition",
  "product_category",
  "group_id",
  "listing_has_variations",
  "variant_dict",
  "shipping_price",
  "accepts_returns",
  "return_deadline_in_days",
  "target_countries",
  "store_country",
] as const;

function chatgptAvailability(item: FeedItem): string {
  if (item.availability === "preorder") return "pre_order";
  return item.availability;
}

function row(item: FeedItem, sellerUrl: string): string[] {
  const onSale =
    item.compareAtPriceCents != null && item.compareAtPriceCents > item.priceCents;
  const hasVariants = Boolean(item.groupId && item.variantOptions);
  return [
    item.id,
    item.title,
    item.description,
    item.link,
    item.brand,
    item.sellerName,
    sellerUrl,
    item.imageUrl,
    item.additionalImageUrls.join(","),
    chatgptAvailability(item),
    feedMoney(onSale ? item.compareAtPriceCents! : item.priceCents, item.currency),
    onSale ? feedMoney(item.priceCents, item.currency) : "",
    item.gtin ?? "",
    item.gtin ? "" : (item.sku ?? ""),
    item.condition,
    item.categoryPath ?? "",
    item.groupId ?? "",
    hasVariants ? "true" : "",
    hasVariants ? JSON.stringify(item.variantOptions) : "",
    item.shippingCents != null ? feedMoney(item.shippingCents, item.currency) : "",
    item.acceptsReturns == null ? "" : item.acceptsReturns ? "true" : "false",
    item.acceptsReturns && item.returnDays != null ? String(item.returnDays) : "",
    JSON.stringify([item.country]),
    item.country,
  ];
}

/** ChatGPT Business Hub product feed (UTF-8 CSV). */
export function serializeChatgptCsv(catalog: FeedCatalog): string {
  const lines = [HEADERS.join(",")];
  for (const item of catalog.items) {
    lines.push(row(item, catalog.link).map(csvCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

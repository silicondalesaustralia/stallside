import { escapeXml, feedMoney } from "./format";
import type { FeedCatalog, FeedItem } from "./types";

function g(tag: string, value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return `<g:${tag}>${escapeXml(value)}</g:${tag}>\n`;
}

function prices(item: FeedItem): string {
  if (item.compareAtPriceCents != null && item.compareAtPriceCents > item.priceCents) {
    return (
      g("price", feedMoney(item.compareAtPriceCents, item.currency)) +
      g("sale_price", feedMoney(item.priceCents, item.currency))
    );
  }
  return g("price", feedMoney(item.priceCents, item.currency));
}

function shipping(item: FeedItem): string {
  if (item.shippingCents == null) return "";
  const price = feedMoney(item.shippingCents, item.currency);
  return `<g:shipping><g:country>${escapeXml(item.country)}</g:country><g:price>${escapeXml(price)}</g:price></g:shipping>\n`;
}

function itemXml(item: FeedItem): string {
  const availability =
    item.availability === "preorder" ? "preorder" : item.availability;
  let body =
    g("id", item.id) +
    `<title>${escapeXml(item.title)}</title>\n` +
    `<link>${escapeXml(item.link)}</link>\n` +
    `<description>${escapeXml(item.description)}</description>\n` +
    g("image_link", item.imageUrl) +
    item.additionalImageUrls.map((u) => g("additional_image_link", u)).join("") +
    g("availability", availability) +
    (availability === "preorder" ? g("availability_date", item.availabilityDate) : "") +
    prices(item) +
    g("condition", item.condition) +
    g("brand", item.brand) +
    g("gtin", item.gtin) +
    g("mpn", item.gtin ? null : item.sku) +
    g("identifier_exists", item.gtin || item.sku ? "yes" : "no") +
    g("item_group_id", item.groupId) +
    g("product_type", item.categoryPath) +
    shipping(item);

  if (item.variantOptions) {
    for (const [name, value] of Object.entries(item.variantOptions)) {
      const key = name.toLowerCase();
      if (key === "color" || key === "colour") body += g("color", value);
      else if (key === "size") body += g("size", value);
    }
  }
  return `<item>\n${body}</item>`;
}

/** Google Merchant Center RSS 2.0 product feed. */
export function serializeGmcXml(catalog: FeedCatalog): string {
  const items = catalog.items.map(itemXml).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${escapeXml(catalog.title)}</title>
<link>${escapeXml(catalog.link)}</link>
<description>Product feed for ${escapeXml(catalog.title)}</description>
${items}
</channel>
</rss>
`;
}

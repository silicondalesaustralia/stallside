import { productRelativePath } from "@/lib/catalogue/main-category";
import { productImageList } from "@/lib/product-images";
import { isOnSale } from "@/lib/product-sale-price";
import { optionNamesOf, variantLabel } from "@/lib/product-variants/variant-title";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { richTextToPlain } from "@/lib/website/rich-text/plain";
import { feedCountry, feedGtin, truncate } from "./format";
import type { FeedCatalog, FeedItem } from "./types";

export type FeedProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  galleryImageUrls: string[];
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  sku: string | null;
  upc: string | null;
  currency: string;
  isPreOrder: boolean;
  collectionAt: Date | null;
  shippingCents: number | null;
  option1Name: string | null;
  option2Name: string | null;
  option3Name: string | null;
  mainCategorySlug: string | null;
  categoryTitle: string | null;
  variants: {
    id: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    sku: string | null;
    upc: string | null;
    priceCents: number;
    compareAtCents: number | null;
    stockQuantity: number;
    imageUrl: string | null;
  }[];
};

export type FeedBuildInput = {
  slug: string;
  brandName: string;
  homeUrl: string;
  primaryCustomHostname: string | null;
  currency: string;
  country: string | null;
  acceptsReturns: boolean | null;
  returnDays: number | null;
  products: FeedProductRow[];
};

function availabilityOf(stock: number, isPreOrder: boolean): FeedItem["availability"] {
  if (stock <= 0) return "out_of_stock";
  if (isPreOrder) return "preorder";
  return "in_stock";
}

function imagesOf(main: string | null, gallery: string[]): string[] {
  return productImageList(main, gallery).filter((u) => /^https?:\/\//i.test(u));
}

function itemFrom(
  input: FeedBuildInput,
  p: FeedProductRow,
  row: {
    id: string;
    title: string;
    priceCents: number;
    compareAt: number | null;
    stock: number;
    sku: string | null;
    upc: string | null;
    imageUrl: string | null;
    options: Record<string, string> | null;
    groupId: string | null;
  },
): FeedItem | null {
  const images = imagesOf(row.imageUrl ?? p.imageUrl, p.galleryImageUrls);
  if (!images[0]) return null;
  const path = productRelativePath(p.slug, p.mainCategorySlug);
  const link = storefrontPublicUrl(input.slug, {
    path,
    primaryCustomHostname: input.primaryCustomHostname,
  });
  const description =
    richTextToPlain(p.description) || truncate(`${p.name}. From ${input.brandName}.`, 5000);
  const onSale = isOnSale(row.priceCents, row.compareAt);
  return {
    id: row.sku?.trim() || row.id,
    groupId: row.groupId,
    title: truncate(row.title, 150),
    description: truncate(description, 5000),
    link,
    imageUrl: images[0],
    additionalImageUrls: images.slice(1),
    availability: availabilityOf(row.stock, p.isPreOrder),
    priceCents: row.priceCents,
    compareAtPriceCents: onSale ? row.compareAt : null,
    currency: (p.currency || input.currency).toUpperCase(),
    brand: input.brandName,
    sellerName: input.brandName,
    sku: row.sku?.trim() || null,
    gtin: feedGtin(row.upc),
    categoryPath: p.categoryTitle,
    shippingCents: p.shippingCents,
    country: feedCountry(input.country, p.currency || input.currency),
    condition: "new",
    isPreOrder: p.isPreOrder,
    availabilityDate: p.isPreOrder && p.collectionAt ? p.collectionAt.toISOString() : null,
    variantOptions: row.options,
    acceptsReturns: input.acceptsReturns,
    returnDays: input.returnDays,
  };
}

/** Expand catalogue products into feed rows (one per variant when present). */
export function buildFeedCatalog(input: FeedBuildInput): FeedCatalog {
  const items: FeedItem[] = [];
  for (const p of input.products) {
    const names = optionNamesOf(p);
    if (p.variants.length > 0 && names.length > 0) {
      for (const v of p.variants) {
        const options: Record<string, string> = {};
        const values = [v.option1, v.option2, v.option3];
        names.forEach((name, i) => {
          const value = values[i]?.trim();
          if (value) options[name] = value;
        });
        const row = itemFrom(input, p, {
          id: v.id,
          title: `${p.name} — ${variantLabel(v)}`,
          priceCents: v.priceCents,
          compareAt: v.compareAtCents,
          stock: v.stockQuantity,
          sku: v.sku,
          upc: v.upc,
          imageUrl: v.imageUrl,
          options,
          groupId: p.id,
        });
        if (row) items.push(row);
      }
      continue;
    }
    const row = itemFrom(input, p, {
      id: p.id,
      title: p.name,
      priceCents: p.priceCents,
      compareAt: p.compareAtPriceCents,
      stock: p.stockQuantity,
      sku: p.sku,
      upc: p.upc,
      imageUrl: p.imageUrl,
      options: null,
      groupId: null,
    });
    if (row) items.push(row);
  }
  return { title: input.brandName, link: input.homeUrl, items };
}

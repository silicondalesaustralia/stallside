import { prisma } from "@/lib/prisma";
import { isReservedProductSlug, slugify } from "@/lib/slug";
import { PRODUCT_DESCRIPTION_MAX } from "@/lib/product-limits";
import type { CsvRow } from "../parse-csv";
import type { DataContext, ImportPlan, PlannedRow, RowError } from "../context";
import { duplicateKeys, RowReader } from "../row-reader";
import { parseDollars, parseWholeNumber, parseYesNo, splitList } from "../values";

const MAX_GALLERY = 7;

export type ProductRow = {
  slug: string;
  name?: string;
  description?: string;
  priceCents?: number;
  compareAtPriceCents?: number;
  costCents?: number;
  sku?: string;
  upc?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isHidden?: boolean;
  sellAtStand?: boolean;
  sellOnline?: boolean;
  preOrderEligible?: boolean;
  /** Undefined when the column is blank (keep existing links). */
  categories?: string[];
  mainCategory?: string;
  imageUrl?: string;
  galleryImageUrls?: string[];
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  gstFree?: boolean;
};

function readRow(r: RowReader): ProductRow {
  const name = r.text("name", 120);
  const categories = splitList(r.text("categories", 2000)).map(slugify).filter(Boolean);
  const gallery = splitList(r.text("gallery_image_urls", 8000));
  if (gallery.length > MAX_GALLERY) r.errors.push(`gallery_image_urls has more than ${MAX_GALLERY} photos`);
  const yes = (column: string) => r.parse(column, parseYesNo, "yes or no");
  const dollars = (column: string) => r.parse(column, parseDollars, "a price like 12.50");
  const whole = (column: string) => r.parse(column, parseWholeNumber, "a whole number");
  return {
    slug: slugify(r.text("slug", 60) ?? name ?? ""),
    name,
    description: r.text("description", PRODUCT_DESCRIPTION_MAX),
    priceCents: dollars("price"),
    compareAtPriceCents: dollars("compare_at_price"),
    costCents: dollars("cost"),
    sku: r.text("sku", 64),
    upc: r.text("upc", 64),
    stockQuantity: whole("stock_quantity"),
    lowStockThreshold: whole("low_stock_threshold"),
    isActive: yes("active"),
    isHidden: yes("hidden"),
    sellAtStand: yes("sell_at_stand"),
    sellOnline: yes("sell_online"),
    preOrderEligible: yes("pre_order_eligible"),
    categories: r.text("categories") === undefined ? undefined : categories,
    mainCategory: slugify(r.text("main_category", 80) ?? "") || undefined,
    imageUrl: r.text("image_url", 1000),
    galleryImageUrls: gallery.length ? gallery.slice(0, MAX_GALLERY) : undefined,
    seoTitle: r.text("seo_title", 120),
    seoDescription: r.text("seo_description", 300),
    sortOrder: whole("sort_order"),
    gstFree: yes("gst_free"),
  };
}

export async function planProducts(rows: CsvRow[], ctx: DataContext): Promise<ImportPlan<ProductRow>> {
  const existing = await prisma.product.findMany({
    where: { standId: ctx.stand.id },
    select: { id: true, slug: true },
  });
  const bySlug = new Map(existing.map((p) => [p.slug, p.id]));
  const planned: PlannedRow<ProductRow>[] = [];
  const errors: RowError[] = [];
  for (const row of rows) {
    const r = new RowReader(row);
    const data = readRow(r);
    const existingId = bySlug.get(data.slug) ?? null;
    if (!data.slug) r.errors.push("slug or name is required");
    else if (isReservedProductSlug(data.slug)) r.errors.push(`slug "${data.slug}" is reserved; choose another`);
    if (!existingId) {
      if (!data.name) r.errors.push("name is required for a new product");
      if (data.priceCents === undefined) r.errors.push("price is required for a new product");
    }
    if (data.stockQuantity !== undefined && data.stockQuantity < 0) r.errors.push("stock_quantity cannot be negative");
    errors.push(...r.toErrors());
    planned.push({ line: row.line, existingId, label: data.name ?? data.slug, data });
  }
  errors.push(...duplicateKeys(planned.map((p) => p.data.slug), planned.map((p) => p.line), "Slug"));
  return { rows: planned, errors };
}

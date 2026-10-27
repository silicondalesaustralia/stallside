import { prisma } from "@/lib/prisma";
import { HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";
import type { CsvRow } from "../parse-csv";
import type { DataContext, ImportPlan, PlannedRow, RowError } from "../context";
import { duplicateKeys, RowReader } from "../row-reader";
import { parseLocalDateTime, parseWholeNumber, parseYesNo, splitList, upperEnum } from "../values";

export type PreOrderRow = {
  slug: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  hideOnBusinessPage?: boolean;
  orderByAt?: Date;
  collectionAt?: Date;
  collectionNote?: string;
  showExactStock?: boolean;
  paymentTiming?: PaymentTiming;
  depositPercent?: number;
  handoverMode?: HandoverMode;
  productIds?: string[];
};

const TIMINGS = ["PAY_NOW", "PAY_UPFRONT", "DEPOSIT_THEN_BALANCE", "PAY_AT_PICKUP"] as const;
const HANDOVERS = ["COLLECT", "DELIVER"] as const;
const DATE_HINT = "a date like 2026-12-18 17:00";

export async function planPreOrders(rows: CsvRow[], ctx: DataContext): Promise<ImportPlan<PreOrderRow>> {
  const [pages, products] = await Promise.all([
    prisma.preOrderPage.findMany({ where: { standId: ctx.stand.id }, select: { id: true, slug: true } }),
    prisma.product.findMany({
      where: { standId: ctx.stand.id, isArchived: false },
      select: { id: true, slug: true },
    }),
  ]);
  const pageBySlug = new Map(pages.map((p) => [p.slug, p.id]));
  const productBySlug = new Map(products.map((p) => [p.slug, p.id]));
  const planned: PlannedRow<PreOrderRow>[] = [];
  const errors: RowError[] = [];

  for (const row of rows) {
    const r = new RowReader(row);
    const title = r.text("title", 120);
    const slug = slugify(r.text("slug", 80) ?? title ?? "");
    const timing = r.parse("payment_timing", (v) => upperEnum(v, TIMINGS), TIMINGS.join(", "));
    const productSlugs = splitList(r.text("products", 5000)).map(slugify);
    const missing = productSlugs.filter((s) => !productBySlug.has(s));
    if (missing.length) r.errors.push(`products not found: ${missing.join(", ")} (import products first)`);
    const data: PreOrderRow = {
      slug,
      title,
      description: r.text("description", 500),
      imageUrl: r.text("image_url", 1000),
      isActive: r.parse("active", parseYesNo, "yes or no"),
      hideOnBusinessPage: r.parse("hide_on_business_page", parseYesNo, "yes or no"),
      orderByAt: r.parse("order_by", (v) => parseLocalDateTime(v, ctx.stand.timeZone), DATE_HINT),
      collectionAt: r.parse("collection", (v) => parseLocalDateTime(v, ctx.stand.timeZone), DATE_HINT),
      collectionNote: r.text("collection_note", 200),
      showExactStock: r.parse("show_exact_stock", parseYesNo, "yes or no"),
      paymentTiming: timing === "PAY_NOW" ? PaymentTiming.PAY_UPFRONT : timing,
      depositPercent: r.parse("deposit_percent", parseWholeNumber, "a whole number"),
      handoverMode: r.parse("handover", (v) => upperEnum(v, HANDOVERS), HANDOVERS.join(" or ")),
      productIds: productSlugs.length ? productSlugs.map((s) => productBySlug.get(s)!).filter(Boolean) : undefined,
    };
    const existingId = pageBySlug.get(slug) ?? null;
    if (!slug) r.errors.push("slug or title is required");
    if (!existingId) {
      if (!title || title.length < 2) r.errors.push("title is required for a new page (2-120 characters)");
      if (!data.orderByAt) r.errors.push("order_by is required for a new page");
      if (!data.collectionAt) r.errors.push("collection is required for a new page");
      if (!data.productIds?.length) r.errors.push("products is required for a new page");
    }
    if (data.orderByAt && data.collectionAt && data.collectionAt < data.orderByAt) {
      r.errors.push("collection must be after order_by");
    }
    if (data.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE) {
      const pct = data.depositPercent;
      if (pct === undefined || pct < 1 || pct > 99) r.errors.push("deposit_percent must be 1-99 for deposits");
    }
    if (data.paymentTiming === PaymentTiming.PAY_AT_PICKUP && data.handoverMode === HandoverMode.DELIVER) {
      r.errors.push("PAY_AT_PICKUP needs handover COLLECT");
    }
    errors.push(...r.toErrors());
    planned.push({ line: row.line, existingId, label: title ?? slug, data });
  }
  errors.push(...duplicateKeys(planned.map((p) => p.data.slug), planned.map((p) => p.line), "Slug"));
  return { rows: planned, errors };
}

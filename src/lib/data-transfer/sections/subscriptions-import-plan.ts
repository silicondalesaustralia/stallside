import { prisma } from "@/lib/prisma";
import { HandoverMode, ShopperSubInterval, SubscriptionOfferKind } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";
import type { CsvRow } from "../parse-csv";
import type { DataContext, ImportPlan, PlannedRow, RowError } from "../context";
import { duplicateKeys, RowReader } from "../row-reader";
import { parseDollars, parseWholeNumber, parseYesNo, splitList, upperEnum } from "../values";

export type SubscriptionRow = {
  slug: string;
  kind: SubscriptionOfferKind;
  title?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  interval?: ShopperSubInterval;
  handoverMode?: HandoverMode;
  collectionWeekday?: number;
  collectionNote?: string;
  maxMembers?: number;
  termWeeks?: number;
  weeklyPriceCents?: number;
  monthlyPriceCents?: number;
  upfrontPriceCents?: number;
  upfrontBenefitsText?: string;
  termsText?: string;
  /** Box contents with each product's current price, for the box total. */
  items?: { productId: string; quantity: number; priceCents: number }[];
};

const KINDS = ["BOX", "MEMBERSHIP"] as const;
const INTERVALS = ["WEEKLY", "FORTNIGHTLY", "MONTHLY"] as const;
const HANDOVERS = ["COLLECT", "DELIVER"] as const;

export async function planSubscriptions(rows: CsvRow[], ctx: DataContext): Promise<ImportPlan<SubscriptionRow>> {
  const [offers, products] = await Promise.all([
    prisma.subscriptionOffer.findMany({ where: { standId: ctx.stand.id }, select: { id: true, slug: true, kind: true } }),
    prisma.product.findMany({
      where: { standId: ctx.stand.id, isArchived: false, isHidden: false },
      select: { id: true, slug: true, priceCents: true },
    }),
  ]);
  const offerBySlug = new Map(offers.map((o) => [o.slug, o]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const planned: PlannedRow<SubscriptionRow>[] = [];
  const errors: RowError[] = [];

  for (const row of rows) {
    const r = new RowReader(row);
    const title = r.text("title", 120);
    const slug = slugify(r.text("slug", 80) ?? title ?? "");
    const existing = offerBySlug.get(slug);
    const kind = r.parse("kind", (v) => upperEnum(v, KINDS), "BOX or MEMBERSHIP") ?? existing?.kind ?? "BOX";
    const dollars = (column: string) => r.parse(column, parseDollars, "a price like 12.50");
    const items: SubscriptionRow["items"] = [];
    for (const entry of splitList(r.text("products", 5000))) {
      const [rawSlug, rawQty] = entry.split(":");
      const product = productBySlug.get(slugify(rawSlug ?? ""));
      const quantity = Math.max(1, Math.min(99, Number.parseInt(rawQty ?? "1", 10) || 1));
      if (!product) r.errors.push(`product "${rawSlug}" not found (import products first)`);
      else items.push({ productId: product.id, quantity, priceCents: product.priceCents });
    }
    const data: SubscriptionRow = {
      slug,
      kind,
      title,
      description: r.text("description", kind === "MEMBERSHIP" ? 2000 : 500),
      imageUrl: r.text("image_url", 1000),
      isActive: r.parse("active", parseYesNo, "yes or no"),
      interval: r.parse("interval", (v) => upperEnum(v, INTERVALS), INTERVALS.join(", ")),
      handoverMode: r.parse("handover", (v) => upperEnum(v, HANDOVERS), "COLLECT or DELIVER"),
      collectionWeekday: r.parse("collection_weekday", parseWholeNumber, "0 (Sunday) to 6 (Saturday)"),
      collectionNote: r.text("collection_note", 200),
      maxMembers: r.parse("max_members", parseWholeNumber, "a whole number"),
      termWeeks: r.parse("term_weeks", parseWholeNumber, "a whole number of weeks"),
      weeklyPriceCents: dollars("weekly_price"),
      monthlyPriceCents: dollars("monthly_price"),
      upfrontPriceCents: dollars("upfront_price"),
      upfrontBenefitsText: r.text("upfront_benefits", 2000),
      termsText: r.text("terms", 5000),
      items: items.length ? items : undefined,
    };
    if (!slug) r.errors.push("slug or title is required");
    if (existing && existing.kind !== kind) r.errors.push("kind cannot change for an existing subscription");
    const weekday = data.collectionWeekday;
    if (weekday !== undefined && (weekday < 0 || weekday > 6)) r.errors.push("collection_weekday must be 0-6");
    if (!existing) {
      if (!title || title.length < 2) r.errors.push("title is required for a new subscription (2-120 characters)");
      if (kind === "BOX") {
        if (!data.items) r.errors.push("products is required for a new box");
        if (!data.interval) r.errors.push("interval is required for a new box");
        const total = (data.items ?? []).reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
        if (data.items && total < 50) r.errors.push("box total must be at least $0.50");
      } else {
        const term = data.termWeeks;
        if (term === undefined || term < 1 || term > 104) r.errors.push("term_weeks must be 1-104 for a membership");
        if (data.weeklyPriceCents === undefined && data.monthlyPriceCents === undefined && data.upfrontPriceCents === undefined) {
          r.errors.push("a membership needs weekly_price, monthly_price or upfront_price");
        }
      }
    }
    errors.push(...r.toErrors());
    planned.push({ line: row.line, existingId: existing?.id ?? null, label: title ?? slug, data });
  }
  errors.push(...duplicateKeys(planned.map((p) => p.data.slug), planned.map((p) => p.line), "Slug"));
  return { rows: planned, errors };
}

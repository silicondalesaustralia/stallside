import { prisma } from "@/lib/prisma";
import { SubscriptionOfferKind } from "@/generated/prisma/client";
import { money, toCsv } from "@/lib/order-export/csv";
import type { DataContext } from "../context";
import { joinList, yesNo } from "../values";

export const SUBSCRIPTION_HEADERS = [
  "slug",
  "kind",
  "title",
  "description",
  "image_url",
  "active",
  "interval",
  "handover",
  "collection_weekday",
  "collection_note",
  "max_members",
  "term_weeks",
  "weekly_price",
  "monthly_price",
  "upfront_price",
  "upfront_benefits",
  "terms",
  "products",
] as const;

export const SUBSCRIPTION_TEMPLATE_ROW = [
  "weekly-veg-box",
  "BOX",
  "Weekly veg box",
  "Seasonal vegetables picked fresh.",
  "",
  "yes",
  "WEEKLY",
  "COLLECT",
  "6",
  "Collect Saturday morning",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "carrots:2|lettuce:1",
];

export async function exportSubscriptions(ctx: DataContext): Promise<string> {
  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId: ctx.stand.id, ownerId: ctx.ownerId },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        select: { quantity: true, product: { select: { slug: true } } },
      },
    },
  });
  const rows = offers.map((o) => {
    const isBox = o.kind === SubscriptionOfferKind.BOX;
    return [
      o.slug,
      o.kind,
      o.title,
      o.description,
      o.imageUrl,
      yesNo(o.isActive),
      o.interval,
      o.handoverMode,
      o.collectionWeekday,
      o.collectionNote,
      o.maxMembers,
      o.termWeeks,
      money(o.weeklyPriceCents),
      money(o.monthlyPriceCents),
      money(o.upfrontPriceCents),
      o.upfrontBenefitsText,
      o.termsText,
      isBox ? joinList(o.items.map((i) => `${i.product.slug}:${i.quantity}`)) : "",
    ];
  });
  return toCsv(SUBSCRIPTION_HEADERS, rows);
}

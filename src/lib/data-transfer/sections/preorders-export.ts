import { prisma } from "@/lib/prisma";
import { toCsv, zonedDateTime } from "@/lib/order-export/csv";
import type { DataContext } from "../context";
import { joinList, yesNo } from "../values";

export const PREORDER_HEADERS = [
  "slug",
  "title",
  "description",
  "image_url",
  "active",
  "hide_on_business_page",
  "order_by",
  "collection",
  "collection_note",
  "show_exact_stock",
  "payment_timing",
  "deposit_percent",
  "handover",
  "products",
] as const;

export const PREORDER_TEMPLATE_ROW = [
  "christmas-hams",
  "Christmas hams",
  "Order by the 18th, collect on the 23rd.",
  "",
  "yes",
  "no",
  "2026-12-18 17:00",
  "2026-12-23 09:00",
  "Collect from the farm gate",
  "no",
  "PAY_UPFRONT",
  "",
  "COLLECT",
  "half-ham|whole-ham",
];

export async function exportPreOrderPages(ctx: DataContext): Promise<string> {
  const pages = await prisma.preOrderPage.findMany({
    where: { standId: ctx.stand.id, ownerId: ctx.ownerId },
    orderBy: { orderByAt: "asc" },
    include: {
      items: { orderBy: { sortOrder: "asc" }, select: { product: { select: { slug: true } } } },
    },
  });
  const rows = pages.map((p) => [
    p.slug,
    p.title,
    p.description,
    p.imageUrl,
    yesNo(p.isActive),
    yesNo(p.hideOnBusinessPage),
    zonedDateTime(p.orderByAt, ctx.stand.timeZone),
    zonedDateTime(p.collectionAt, ctx.stand.timeZone),
    p.collectionNote,
    yesNo(p.showExactStock),
    p.paymentTiming,
    p.depositPercent,
    p.handoverMode,
    joinList(p.items.map((i) => i.product.slug)),
  ]);
  return toCsv(PREORDER_HEADERS, rows);
}

import { prisma } from "@/lib/prisma";
import { money, toCsv } from "@/lib/order-export/csv";
import type { DataContext } from "../context";
import { joinList, yesNo } from "../values";

export const PRODUCT_HEADERS = [
  "slug",
  "name",
  "description",
  "price",
  "compare_at_price",
  "cost",
  "sku",
  "upc",
  "stock_quantity",
  "low_stock_threshold",
  "active",
  "hidden",
  "sell_at_stand",
  "sell_online",
  "pre_order_eligible",
  "categories",
  "main_category",
  "image_url",
  "gallery_image_urls",
  "seo_title",
  "seo_description",
  "sort_order",
  "gst_free",
] as const;

export const PRODUCT_TEMPLATE_ROW = [
  "free-range-eggs",
  "Free range eggs (dozen)",
  "Fresh from our hens this week.",
  "8.00",
  "",
  "3.50",
  "EGG-12",
  "",
  "24",
  "5",
  "yes",
  "no",
  "yes",
  "yes",
  "no",
  "eggs|breakfast",
  "eggs",
  "https://example.com/photos/eggs.jpg",
  "",
  "",
  "",
  "0",
  "no",
];

export async function exportProducts(ctx: DataContext): Promise<string> {
  const products = await prisma.product.findMany({
    where: { standId: ctx.stand.id, ownerId: ctx.ownerId, isArchived: false },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      categoryLinks: { orderBy: { sortOrder: "asc" }, select: { category: { select: { slug: true } } } },
    },
  });
  // Blank cells are fields this version doesn't have; the new dashboard fills defaults on import.
  const rows = products.map((p) => [
    p.slug,
    p.name,
    p.description,
    money(p.priceCents),
    "",
    money(p.costCents),
    p.sku,
    p.upc,
    p.stockQuantity,
    p.lowStockThreshold,
    yesNo(p.isActive),
    yesNo(p.isHidden),
    "",
    "",
    yesNo(p.preOrderEligible),
    joinList(p.categoryLinks.map((l) => l.category.slug)),
    "",
    p.imageUrl,
    "",
    p.seoTitle,
    p.seoDescription,
    p.sortOrder,
    yesNo(p.gstFree),
  ]);
  return toCsv(PRODUCT_HEADERS, rows);
}

import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";
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
];

export async function exportProducts(ctx: DataContext): Promise<string> {
  const products = await prisma.product.findMany({
    where: { standId: ctx.stand.id, ownerId: ctx.ownerId, isArchived: false },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      channels: { where: { isEnabled: true }, select: { channelType: true } },
      categoryLinks: { orderBy: { sortOrder: "asc" }, select: { category: { select: { slug: true } } } },
      primaryCategory: { select: { slug: true } },
    },
  });
  const rows = products.map((p) => {
    const channels = new Set(p.channels.map((c) => c.channelType));
    return [
      p.slug,
      p.name,
      p.description,
      money(p.priceCents),
      money(p.compareAtPriceCents),
      money(p.costCents),
      p.sku,
      p.upc,
      p.stockQuantity,
      p.lowStockThreshold,
      yesNo(p.isActive),
      yesNo(p.isHidden),
      yesNo(channels.has(ProductChannelType.STAND)),
      yesNo(channels.has(ProductChannelType.ONLINE)),
      yesNo(p.preOrderEligible),
      joinList(p.categoryLinks.map((l) => l.category.slug)),
      p.primaryCategory?.slug,
      p.imageUrl,
      joinList(p.galleryImageUrls),
      p.seoTitle,
      p.seoDescription,
      p.sortOrder,
    ];
  });
  return toCsv(PRODUCT_HEADERS, rows);
}

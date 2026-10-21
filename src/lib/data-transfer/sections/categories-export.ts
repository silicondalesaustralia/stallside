import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/order-export/csv";
import type { DataContext } from "../context";
import { yesNo } from "../values";

export const CATEGORY_HEADERS = [
  "slug",
  "title",
  "description",
  "bottom_description",
  "image_url",
  "sort_order",
  "active",
  "show_on_website",
] as const;

export const CATEGORY_TEMPLATE_ROW = [
  "eggs",
  "Eggs",
  "Free range eggs from our flock.",
  "",
  "https://example.com/photos/eggs-category.jpg",
  "1",
  "yes",
  "yes",
];

export async function exportCategories(ctx: DataContext): Promise<string> {
  const categories = await prisma.category.findMany({
    where: { ownerId: ctx.ownerId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  const rows = categories.map((c) => [
    c.slug,
    c.title,
    c.description,
    "",
    c.imageUrl,
    c.sortOrder,
    yesNo(c.isActive),
    yesNo(c.showOnWebsite),
  ]);
  return toCsv(CATEGORY_HEADERS, rows);
}

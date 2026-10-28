import type { Prisma } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";

type Tx = Prisma.TransactionClient;

/** Finds the owner's category by title (case-insensitive) or creates it, then links the product. */
export async function linkImportCategory(
  tx: Tx,
  ownerId: string,
  productId: string,
  title: string,
) {
  const clean = title.trim();
  if (!clean) return;
  let category = await tx.category.findFirst({
    where: { ownerId, title: { equals: clean, mode: "insensitive" } },
    select: { id: true },
  });
  if (!category) {
    const root = slugify(clean) || "category";
    const taken = await tx.category.findMany({
      where: { ownerId, slug: { startsWith: root } },
      select: { slug: true },
    });
    const used = new Set(taken.map((c) => c.slug));
    let slug = root;
    for (let i = 2; used.has(slug); i++) slug = `${root}-${i}`;
    category = await tx.category.create({
      data: { ownerId, title: clean.slice(0, 80), slug },
      select: { id: true },
    });
  }
  await tx.productCategory.upsert({
    where: { productId_categoryId: { productId, categoryId: category.id } },
    create: { productId, categoryId: category.id },
    update: {},
  });
}

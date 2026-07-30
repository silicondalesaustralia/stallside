"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";

async function productSlugExists(
  standId: string,
  slug: string,
  excludeId?: string,
) {
  const found = await prisma.product.findFirst({
    where: {
      standId,
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(found);
}

async function ownedProduct(productId: string, ownerId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    include: {
      stand: { select: { slug: true, id: true } },
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

function revalidateProductPaths(opts: {
  standId: string;
  standSlug: string;
  productId: string;
  slug: string;
}) {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/products/${opts.productId}`);
  revalidatePath(`/dashboard/stands/${opts.standId}`);
  revalidatePath(`/s/${opts.standSlug}`);
  revalidatePath(`/s/${opts.standSlug}/${opts.slug}`);
}

/** Copy a product for editing; new slug, not hidden/archived. */
export async function duplicateProduct(productId: string) {
  const { owner } = await requireOwner();
  const source = await ownedProduct(productId, owner.id);
  if (!source) return { error: "Product not found." };

  const name = `${source.name} (copy)`.slice(0, 120);
  const slug = await uniqueProductSlug(source.standId, name, (sid, s) =>
    productSlugExists(sid, s),
  );

  const copy = await prisma.product.create({
    data: {
      ownerId: owner.id,
      standId: source.standId,
      name,
      slug,
      description: source.description,
      imageUrl: source.imageUrl,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      priceCents: source.priceCents,
      currency: source.currency,
      stockQuantity: source.stockQuantity,
      lowStockThreshold: source.lowStockThreshold,
      isActive: true,
      isHidden: false,
      isArchived: false,
      sortOrder: source.sortOrder,
      isPreOrder: source.isPreOrder,
      orderByAt: source.orderByAt,
      collectionAt: source.collectionAt,
      collectionNote: source.collectionNote,
      showExactStock: source.showExactStock,
      optionGroups: {
        create: source.optionGroups.map((g, gi) => ({
          name: g.name,
          sortOrder: gi,
          choices: {
            create: g.choices.map((c, ci) => ({
              name: c.name,
              priceDeltaCents: c.priceDeltaCents,
              sortOrder: ci,
            })),
          },
        })),
      },
    },
  });

  revalidateProductPaths({
    standId: source.standId,
    standSlug: source.stand.slug,
    productId: copy.id,
    slug: copy.slug,
  });
  redirect(`/dashboard/products/${copy.id}`);
}

export async function setProductHidden(productId: string, hidden: boolean) {
  const { owner } = await requireOwner();
  const product = await ownedProduct(productId, owner.id);
  if (!product) return { error: "Product not found." };
  if (product.isArchived) {
    return { error: "Restore the product before changing catalog visibility." };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { isHidden: hidden },
  });

  revalidateProductPaths({
    standId: product.standId,
    standSlug: product.stand.slug,
    productId: product.id,
    slug: product.slug,
  });
  return { ok: true as const };
}

export async function archiveProduct(productId: string) {
  const { owner } = await requireOwner();
  const product = await ownedProduct(productId, owner.id);
  if (!product) return { error: "Product not found." };

  await prisma.product.update({
    where: { id: product.id },
    data: { isArchived: true, isActive: false, isHidden: false },
  });

  revalidateProductPaths({
    standId: product.standId,
    standSlug: product.stand.slug,
    productId: product.id,
    slug: product.slug,
  });
  return { ok: true as const };
}

export async function restoreProduct(productId: string) {
  const { owner } = await requireOwner();
  const product = await ownedProduct(productId, owner.id);
  if (!product) return { error: "Product not found." };

  await prisma.product.update({
    where: { id: product.id },
    data: { isArchived: false, isActive: true },
  });

  revalidateProductPaths({
    standId: product.standId,
    standSlug: product.stand.slug,
    productId: product.id,
    slug: product.slug,
  });
  return { ok: true as const };
}

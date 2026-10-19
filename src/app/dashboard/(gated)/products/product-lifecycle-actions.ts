"use server";

import { redirect } from "next/navigation";
import { revalidateProductPaths, setOwnerProductStatus } from "@/lib/products/lifecycle";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";
import { parseImageAlts } from "@/lib/product-image-alts";

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

/** Copy a product for editing; new slug, not hidden/archived. */
export async function duplicateProduct(productId: string) {
  const { owner } = await requireOwnerWrite();
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
      galleryImageUrls: source.galleryImageUrls,
      imageAlts: parseImageAlts(source.imageAlts),
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      priceCents: source.priceCents,
      costCents: source.costCents,
      sku: source.sku,
      upc: source.upc,
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
      paymentTiming: source.paymentTiming,
      depositPercent: source.depositPercent,
      handoverMode: source.handoverMode,
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
  const { owner } = await requireOwnerWrite();
  return setOwnerProductStatus(owner.id, productId, hidden ? "hide" : "show");
}

export async function archiveProduct(productId: string) {
  const { owner } = await requireOwnerWrite();
  return setOwnerProductStatus(owner.id, productId, "archive");
}

export async function restoreProduct(productId: string) {
  const { owner } = await requireOwnerWrite();
  return setOwnerProductStatus(owner.id, productId, "restore");
}

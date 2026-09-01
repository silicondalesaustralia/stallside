"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";

export async function saveProductChannels(
  productId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    select: { id: true, standId: true },
  });
  if (!product) return { error: "Product not found." };

  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    select: { id: true, slug: true },
  });
  const standIds = new Set(stands.map((s) => s.id));
  const primaryId = await primaryStandIdForOwner(owner.id);

  const enabledStandIds = formData
    .getAll("standId")
    .map(String)
    .filter((id) => standIds.has(id));
  const showOnline = formData.get("showOnline") === "on";

  if (enabledStandIds.length === 0) {
    return { error: "Assign at least one stand or location." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.productChannel.deleteMany({ where: { productId } });

    for (const standId of enabledStandIds) {
      await tx.productChannel.create({
        data: {
          productId,
          channelType: ProductChannelType.STAND,
          standId,
          isEnabled: true,
        },
      });
    }

    const onlineStandId =
      (primaryId && enabledStandIds.includes(primaryId)
        ? primaryId
        : enabledStandIds[0]) ?? null;
    if (showOnline && onlineStandId) {
      await tx.productChannel.create({
        data: {
          productId,
          channelType: ProductChannelType.ONLINE,
          standId: onlineStandId,
          isEnabled: true,
        },
      });
    }

    // Keep legacy standId as first assigned / primary for URLs & inventory.
    const nextStandId = enabledStandIds.includes(product.standId)
      ? product.standId
      : enabledStandIds[0]!;
    if (nextStandId !== product.standId) {
      await tx.product.update({
        where: { id: productId },
        data: { standId: nextStandId },
      });
    }
  });

  for (const s of stands) {
    revalidatePath(`/s/${s.slug}`);
    revalidateTag(standCatalogTag(s.slug), "max");
  }
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
  return { ok: true as const };
}

export async function saveProductCategories(
  productId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    select: { id: true },
  });
  if (!product) return { error: "Product not found." };

  const categories = await prisma.category.findMany({
    where: { ownerId: owner.id },
    select: { id: true },
  });
  const allowed = new Set(categories.map((c) => c.id));
  const selected = formData
    .getAll("categoryId")
    .map(String)
    .filter((id) => allowed.has(id));

  await prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany({ where: { productId } });
    if (selected.length === 0) return;
    await tx.productCategory.createMany({
      data: selected.map((categoryId, i) => ({
        productId,
        categoryId,
        sortOrder: i,
      })),
    });
  });

  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/categories");
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { InventorySource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";
import { uploadProductImage } from "@/lib/product-image-upload";
import { requireSupplier } from "@/lib/suppliers/access";
import { notifySupplierStock } from "@/lib/suppliers/notify-stock";

async function slugTaken(standId: string, slug: string) {
  const found = await prisma.product.findFirst({
    where: { standId, slug },
    select: { id: true },
  });
  return Boolean(found);
}

export async function createSupplierProduct(formData: FormData) {
  const standId = String(formData.get("standId") ?? "");
  const { membership } = await requireSupplier(standId);
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const stockQuantity = Number.parseInt(
    String(formData.get("stockQuantity") ?? "0"),
    10,
  );
  if (!name || name.length > 120) return { error: "Enter a product name." };
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return { error: "Enter a stock quantity." };
  }

  try {
    const slug = await uniqueProductSlug(membership.standId, name, slugTaken);
    const product = await prisma.product.create({
      data: {
        standId: membership.standId,
        ownerId: membership.stand.ownerId,
        memberId: membership.id,
        name,
        slug,
        description: description || null,
        priceCents: 0,
        currency: membership.stand.currency,
        stockQuantity,
        isActive: false,
        isHidden: true,
        isArchived: true,
      },
    });

    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      const imageUrl = await uploadProductImage(
        membership.standId,
        product.id,
        image,
      );
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl },
      });
    }

    if (stockQuantity > 0) {
      await prisma.inventoryAdjustment.create({
        data: {
          productId: product.id,
          ownerId: membership.stand.ownerId,
          standId: membership.standId,
          memberId: membership.id,
          changeQuantity: stockQuantity,
          previousQuantity: 0,
          newQuantity: stockQuantity,
          reason: `${membership.name} added stock`,
          source: InventorySource.OWNER_MANUAL,
        },
      });
    }

    try {
      await notifySupplierStock({
        ownerId: membership.stand.ownerId,
        standId: membership.standId,
        standName: membership.stand.name,
        timezone: membership.stand.timezone,
        memberName: membership.name,
        productId: product.id,
        productName: name,
        changeQuantity: stockQuantity,
        at: new Date(),
      });
    } catch (error) {
      console.error("Supplier stock notify failed", error);
    }
  } catch (error) {
    console.error("Supplier product create failed", error);
    return {
      error: error instanceof Error ? error.message : "Could not add the product.",
    };
  }

  revalidatePath("/supply");
  revalidatePath("/dashboard/suppliers");
  return { ok: true as const };
}

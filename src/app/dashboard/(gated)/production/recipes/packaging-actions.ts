"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { convertQuantity } from "@/lib/production/unit-convert";
import { cents, decimal, failure, text, unit, type ActionResult } from "@/lib/production/form-parse";

export async function addProductPackaging(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const productId = text(formData, "productId");
    const ingredientId = text(formData, "ingredientId");
    const quantity = decimal(formData, "quantity", true);
    const lineUnit = unit(formData, "unit");
    if (quantity == null) return { error: "Enter how many go in one product." };
    const [product, material] = await Promise.all([
      prisma.product.findFirst({
        where: { id: productId, ownerId: owner.id },
        select: { id: true, _count: { select: { packagingLines: true } } },
      }),
      prisma.ingredient.findFirst({
        where: { id: ingredientId, ownerId: owner.id },
        select: { id: true, name: true, baseUnit: true },
      }),
    ]);
    if (!product) return { error: "Product not found." };
    if (!material || !lineUnit) return { error: "Choose a packaging material." };
    if (convertQuantity(1, lineUnit, material.baseUnit) == null) {
      return { error: `${material.name} is measured in ${material.baseUnit}; pick a matching unit.` };
    }
    await prisma.productPackaging.upsert({
      where: { productId_ingredientId: { productId, ingredientId } },
      create: { productId, ingredientId, quantity, unit: lineUnit, sortOrder: product._count.packagingLines },
      update: { quantity, unit: lineUnit },
    });
    revalidatePath("/dashboard/production", "layout");
    return { ok: true };
  } catch (error) {
    return failure("addProductPackaging failed", error);
  }
}

export async function removeProductPackaging(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.productPackaging.deleteMany({
      where: { id: text(formData, "id"), product: { ownerId: owner.id } },
    });
    if (result.count === 0) return { error: "Packaging line not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true };
  } catch (error) {
    return failure("removeProductPackaging failed", error);
  }
}

export async function saveOtherPackaging(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.product.updateMany({
      where: { id: text(formData, "productId"), ownerId: owner.id },
      data: { packagingCostCents: cents(formData, "packaging") },
    });
    if (result.count === 0) return { error: "Product not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: "Saved." };
  } catch (error) {
    return failure("saveOtherPackaging failed", error);
  }
}

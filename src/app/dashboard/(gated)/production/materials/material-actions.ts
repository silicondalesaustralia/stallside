"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { convertQuantity } from "@/lib/production/unit-convert";
import {
  cents,
  decimal,
  failure,
  optionalText,
  text,
  unit,
  type ActionResult,
} from "@/lib/production/form-parse";

/** Create (no `id`) or update an ingredient / part. */
export async function saveMaterial(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const id = text(formData, "id");
    const name = text(formData, "name");
    const baseUnit = unit(formData, "baseUnit");
    const purchaseUnit = unit(formData, "purchaseUnit");
    const purchaseQuantity = decimal(formData, "purchaseQuantity", true);
    const purchasePriceCents = cents(formData, "purchasePrice");
    const onHand = decimal(formData, "onHand");
    if (!name) return { error: "Enter a name." };
    if (!baseUnit || !purchaseUnit) return { error: "Choose units." };
    if (purchaseQuantity == null) return { error: "Enter how much comes in one pack." };
    if (purchasePriceCents == null) return { error: "Enter the pack price." };
    if (convertQuantity(1, purchaseUnit, baseUnit) == null) {
      return { error: "Pack unit must be the same kind as the recipe unit (weight, volume or count)." };
    }

    const data = {
      name,
      baseUnit,
      purchaseUnit,
      purchaseQuantity,
      purchasePriceCents,
      supplier: optionalText(formData, "supplier"),
      sku: optionalText(formData, "sku"),
      notes: optionalText(formData, "notes"),
      reorderLevel: decimal(formData, "reorderLevel"),
      ...(onHand == null ? {} : { onHandQuantity: onHand }),
    };

    if (!id) {
      const created = await prisma.ingredient.create({ data: { ...data, ownerId: owner.id } });
      revalidatePath("/dashboard/production/materials");
      return { ok: true, message: "Material added.", redirectTo: `/dashboard/production/materials/${created.id}` };
    }

    const existing = await prisma.ingredient.findFirst({ where: { id, ownerId: owner.id } });
    if (!existing) return { error: "Material not found." };
    const priceChanged =
      existing.purchasePriceCents !== purchasePriceCents ||
      Number(existing.purchaseQuantity) !== purchaseQuantity ||
      existing.purchaseUnit !== purchaseUnit;
    await prisma.$transaction([
      prisma.ingredient.update({ where: { id }, data }),
      ...(priceChanged
        ? [
            prisma.ingredientCostHistory.create({
              data: { ingredientId: id, purchaseQuantity, purchaseUnit, purchasePriceCents, note: "Price edited" },
            }),
          ]
        : []),
    ]);
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: "Saved." };
  } catch (error) {
    return failure("saveMaterial failed", error);
  }
}

export async function setMaterialActive(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const id = text(formData, "id");
    const isActive = text(formData, "isActive") === "true";
    const result = await prisma.ingredient.updateMany({ where: { id, ownerId: owner.id }, data: { isActive } });
    if (result.count === 0) return { error: "Material not found." };
    revalidatePath("/dashboard/production", "layout");
    return { ok: true, message: isActive ? "Restored." : "Archived." };
  } catch (error) {
    return failure("setMaterialActive failed", error);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MeasureUnit, Prisma } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { isMeasureUnit, unitsCompatible } from "@/lib/production/units";

function parseUnit(raw: FormDataEntryValue | null): MeasureUnit {
  const v = String(raw ?? "").toUpperCase();
  if (!isMeasureUnit(v)) throw new Error("Invalid unit");
  return v as MeasureUnit;
}

function parseQty(raw: FormDataEntryValue | null): Prisma.Decimal {
  const n = Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Quantity must be > 0");
  return new Prisma.Decimal(n);
}

export async function createIngredient(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1) throw new Error("Name required");

  const baseUnit = parseUnit(formData.get("baseUnit"));
  const purchaseUnit = parseUnit(formData.get("purchaseUnit"));
  if (!unitsCompatible(baseUnit, purchaseUnit)) {
    throw new Error("Purchase unit must match base unit type");
  }
  const purchaseQuantity = parseQty(formData.get("purchaseQuantity"));
  const purchasePriceCents = dollarsToCents(
    String(formData.get("purchasePrice") ?? "0"),
  );

  const created = await prisma.ingredient.create({
    data: {
      ownerId: owner.id,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      baseUnit,
      purchaseUnit,
      purchaseQuantity,
      purchasePriceCents,
      supplier: String(formData.get("supplier") ?? "").trim() || null,
      sku: String(formData.get("sku") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      costHistory: {
        create: {
          purchaseQuantity,
          purchaseUnit,
          purchasePriceCents,
          note: "Initial",
        },
      },
    },
  });

  revalidatePath("/dashboard/ingredients");
  redirect(`/dashboard/ingredients/${created.id}`);
}

export async function updateIngredient(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.ingredient.findFirst({
    where: { id, ownerId: owner.id },
  });
  if (!existing) throw new Error("Ingredient not found");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1) throw new Error("Name required");

  const baseUnit = parseUnit(formData.get("baseUnit"));
  const purchaseUnit = parseUnit(formData.get("purchaseUnit"));
  if (!unitsCompatible(baseUnit, purchaseUnit)) {
    throw new Error("Purchase unit must match base unit type");
  }
  const purchaseQuantity = parseQty(formData.get("purchaseQuantity"));
  const purchasePriceCents = dollarsToCents(
    String(formData.get("purchasePrice") ?? "0"),
  );

  const priceChanged =
    existing.purchasePriceCents !== purchasePriceCents ||
    existing.purchaseQuantity.toString() !== purchaseQuantity.toString() ||
    existing.purchaseUnit !== purchaseUnit;

  await prisma.$transaction(async (tx) => {
    await tx.ingredient.update({
      where: { id },
      data: {
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        baseUnit,
        purchaseUnit,
        purchaseQuantity,
        purchasePriceCents,
        supplier: String(formData.get("supplier") ?? "").trim() || null,
        sku: String(formData.get("sku") ?? "").trim() || null,
        notes: String(formData.get("notes") ?? "").trim() || null,
        isActive: formData.get("isActive") === "on",
      },
    });
    if (priceChanged) {
      await tx.ingredientCostHistory.create({
        data: {
          ingredientId: id,
          purchaseQuantity,
          purchaseUnit,
          purchasePriceCents,
        },
      });
    }
  });

  revalidatePath("/dashboard/ingredients");
  revalidatePath(`/dashboard/ingredients/${id}`);
  redirect(`/dashboard/ingredients/${id}?saved=1`);
}

export async function archiveIngredient(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.ingredient.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Ingredient not found");

  await prisma.ingredient.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/ingredients");
  redirect("/dashboard/ingredients");
}

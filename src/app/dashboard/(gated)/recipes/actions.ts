"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MeasureUnit, Prisma } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { assertNoRecipeCycle } from "@/lib/production/recipe-cost";
import { isMeasureUnit } from "@/lib/production/units";

function parseQty(raw: string): Prisma.Decimal {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Quantity must be > 0");
  return new Prisma.Decimal(n);
}

type LineInput =
  | { kind: "ingredient"; ingredientId: string; quantity: Prisma.Decimal; unit: MeasureUnit }
  | { kind: "component"; componentRecipeId: string; quantity: Prisma.Decimal };

function parseLines(formData: FormData): LineInput[] {
  const kinds = formData.getAll("lineKind").map(String);
  const ingredientIds = formData.getAll("lineIngredientId").map(String);
  const componentIds = formData.getAll("lineComponentId").map(String);
  const qtys = formData.getAll("lineQuantity").map(String);
  const units = formData.getAll("lineUnit").map(String);
  const lines: LineInput[] = [];
  for (let i = 0; i < kinds.length; i += 1) {
    const kind = kinds[i];
    const qty = parseQty(qtys[i] ?? "");
    if (kind === "ingredient") {
      const ingredientId = ingredientIds[i] ?? "";
      const unitRaw = (units[i] ?? "").toUpperCase();
      if (!ingredientId || !isMeasureUnit(unitRaw)) continue;
      lines.push({
        kind: "ingredient",
        ingredientId,
        quantity: qty,
        unit: unitRaw as MeasureUnit,
      });
    } else if (kind === "component") {
      const componentRecipeId = componentIds[i] ?? "";
      if (!componentRecipeId) continue;
      lines.push({ kind: "component", componentRecipeId, quantity: qty });
    }
  }
  return lines;
}

async function assertOwnedIngredients(ownerId: string, ids: string[]) {
  if (ids.length === 0) return;
  const count = await prisma.ingredient.count({
    where: { ownerId, id: { in: ids } },
  });
  if (count !== new Set(ids).size) throw new Error("Invalid ingredient");
}

async function assertOwnedRecipes(ownerId: string, ids: string[]) {
  if (ids.length === 0) return;
  const count = await prisma.recipe.count({
    where: { ownerId, id: { in: ids } },
  });
  if (count !== new Set(ids).size) throw new Error("Invalid recipe");
}

export async function createRecipe(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1) throw new Error("Name required");
  const yieldQuantity = parseQty(String(formData.get("yieldQuantity") ?? ""));
  const yieldLabel =
    String(formData.get("yieldLabel") ?? "").trim() || "units";
  const lines = parseLines(formData);

  await assertOwnedIngredients(
    owner.id,
    lines.filter((l) => l.kind === "ingredient").map((l) => l.ingredientId),
  );
  await assertOwnedRecipes(
    owner.id,
    lines.filter((l) => l.kind === "component").map((l) => l.componentRecipeId),
  );

  const created = await prisma.recipe.create({
    data: {
      ownerId: owner.id,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      yieldQuantity,
      yieldLabel,
      instructions: String(formData.get("instructions") ?? "").trim() || null,
      prepNotes: String(formData.get("prepNotes") ?? "").trim() || null,
      lines: {
        create: lines.map((line, sortOrder) =>
          line.kind === "ingredient"
            ? {
                ingredientId: line.ingredientId,
                quantity: line.quantity,
                unit: line.unit,
                sortOrder,
              }
            : {
                componentRecipeId: line.componentRecipeId,
                quantity: line.quantity,
                sortOrder,
              },
        ),
      },
    },
  });

  revalidatePath("/dashboard/recipes");
  redirect(`/dashboard/recipes/${created.id}`);
}

export async function updateRecipe(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.recipe.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Recipe not found");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1) throw new Error("Name required");
  const yieldQuantity = parseQty(String(formData.get("yieldQuantity") ?? ""));
  const yieldLabel =
    String(formData.get("yieldLabel") ?? "").trim() || "units";
  const lines = parseLines(formData);

  await assertOwnedIngredients(
    owner.id,
    lines.filter((l) => l.kind === "ingredient").map((l) => l.ingredientId),
  );
  const componentIds = lines
    .filter((l) => l.kind === "component")
    .map((l) => l.componentRecipeId);
  await assertOwnedRecipes(owner.id, componentIds);
  for (const cid of componentIds) {
    await assertNoRecipeCycle(owner.id, id, cid);
  }

  await prisma.$transaction(async (tx) => {
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await tx.recipe.update({
      where: { id },
      data: {
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        yieldQuantity,
        yieldLabel,
        instructions: String(formData.get("instructions") ?? "").trim() || null,
        prepNotes: String(formData.get("prepNotes") ?? "").trim() || null,
        isActive: formData.get("isActive") === "on",
        lines: {
          create: lines.map((line, sortOrder) =>
            line.kind === "ingredient"
              ? {
                  ingredientId: line.ingredientId,
                  quantity: line.quantity,
                  unit: line.unit,
                  sortOrder,
                }
              : {
                  componentRecipeId: line.componentRecipeId,
                  quantity: line.quantity,
                  sortOrder,
                },
          ),
        },
      },
    });
  });

  revalidatePath("/dashboard/recipes");
  revalidatePath(`/dashboard/recipes/${id}`);
  redirect(`/dashboard/recipes/${id}?saved=1`);
}

export async function duplicateRecipe(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const recipe = await prisma.recipe.findFirst({
    where: { id, ownerId: owner.id },
    include: { lines: true },
  });
  if (!recipe) throw new Error("Recipe not found");

  const copy = await prisma.recipe.create({
    data: {
      ownerId: owner.id,
      name: `${recipe.name} (copy)`,
      description: recipe.description,
      yieldQuantity: recipe.yieldQuantity,
      yieldLabel: recipe.yieldLabel,
      instructions: recipe.instructions,
      prepNotes: recipe.prepNotes,
      lines: {
        create: recipe.lines.map((line) => ({
          ingredientId: line.ingredientId,
          componentRecipeId: line.componentRecipeId,
          quantity: line.quantity,
          unit: line.unit,
          sortOrder: line.sortOrder,
        })),
      },
    },
  });
  revalidatePath("/dashboard/recipes");
  redirect(`/dashboard/recipes/${copy.id}`);
}

export async function archiveRecipe(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.recipe.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Recipe not found");
  await prisma.recipe.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/recipes");
  redirect("/dashboard/recipes");
}

export async function saveProductRecipe(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const productId = String(formData.get("productId") ?? "");
  const recipeId = String(formData.get("recipeId") ?? "").trim();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    select: { id: true },
  });
  if (!product) throw new Error("Product not found");

  if (!recipeId) {
    await prisma.productRecipe.deleteMany({ where: { productId } });
    revalidatePath(`/dashboard/products/${productId}`);
    redirect(`/dashboard/products/${productId}?saved=1`);
  }

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, ownerId: owner.id, isActive: true },
    select: { id: true },
  });
  if (!recipe) throw new Error("Recipe not found");

  const yieldUnitsPerProduct = parseQty(
    String(formData.get("yieldUnitsPerProduct") ?? "1"),
  );
  const packagingRaw = String(formData.get("packagingCost") ?? "").trim();
  const packagingCostCents =
    packagingRaw === ""
      ? null
      : Math.round(Number.parseFloat(packagingRaw) * 100);

  await prisma.$transaction([
    prisma.productRecipe.upsert({
      where: { productId },
      create: { productId, recipeId, yieldUnitsPerProduct },
      update: { recipeId, yieldUnitsPerProduct },
    }),
    prisma.product.update({
      where: { id: productId },
      data: {
        packagingCostCents:
          packagingCostCents != null && Number.isFinite(packagingCostCents)
            ? Math.max(0, packagingCostCents)
            : null,
      },
    }),
  ]);

  revalidatePath(`/dashboard/products/${productId}`);
  redirect(`/dashboard/products/${productId}?saved=1`);
}

export async function saveProductionPlan(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const standId = String(formData.get("standId") ?? "");
  const groupKey = String(formData.get("groupKey") ?? "");
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true },
  });
  if (!stand || !groupKey) throw new Error("Invalid production plan");

  const statusRaw = String(formData.get("status") ?? "PLANNED");
  const status =
    statusRaw === "IN_PROGRESS" || statusRaw === "COMPLETE"
      ? statusRaw
      : "PLANNED";

  await prisma.productionPlan.upsert({
    where: {
      ownerId_groupKey: { ownerId: owner.id, groupKey },
    },
    create: {
      ownerId: owner.id,
      standId,
      groupKey,
      notes: String(formData.get("notes") ?? "").trim() || null,
      title: String(formData.get("title") ?? "").trim() || null,
      status,
    },
    update: {
      notes: String(formData.get("notes") ?? "").trim() || null,
      status,
    },
  });

  revalidatePath("/dashboard/production");
  redirect(`/dashboard/production?saved=1&key=${encodeURIComponent(groupKey)}`);
}

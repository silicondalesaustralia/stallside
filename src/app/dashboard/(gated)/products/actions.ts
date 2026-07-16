"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { InventorySource } from "@/generated/prisma/client";
import { notifyLowStockForProducts } from "@/lib/notify";

const productSchema = z.object({
  standId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  price: z.string().min(1),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
});

export async function createProduct(formData: FormData) {
  const { owner } = await requireOwner();
  const parsed = productSchema.safeParse({
    standId: formData.get("standId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stockQuantity: formData.get("stockQuantity") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
  });
  if (!parsed.success) {
    throw new Error("Check product details.");
  }

  const stand = await prisma.stand.findFirst({
    where: { id: parsed.data.standId, ownerId: owner.id },
  });
  if (!stand) {
    throw new Error("Stand not found.");
  }

  let priceCents: number;
  try {
    priceCents = dollarsToCents(parsed.data.price);
  } catch {
    throw new Error("Invalid price.");
  }

  const product = await prisma.product.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents,
      currency: stand.currency,
      stockQuantity: parsed.data.stockQuantity,
      lowStockThreshold: parsed.data.lowStockThreshold,
      isActive: true,
    },
  });

  if (parsed.data.stockQuantity > 0) {
    await prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: owner.id,
        standId: stand.id,
        changeQuantity: parsed.data.stockQuantity,
        previousQuantity: 0,
        newQuantity: parsed.data.stockQuantity,
        reason: "Initial stock",
        source: InventorySource.OWNER_MANUAL,
      },
    });
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function adjustInventory(formData: FormData) {
  const { owner } = await requireOwner();
  const productId = String(formData.get("productId") ?? "");
  const mode = String(formData.get("mode") ?? "set");
  const amount = Number.parseInt(String(formData.get("amount") ?? ""), 10);
  const reason = String(formData.get("reason") ?? "Manual adjustment").trim();

  if (!productId || !Number.isFinite(amount)) {
    return { error: "Invalid adjustment." };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
  });
  if (!product) return { error: "Product not found." };

  const previous = product.stockQuantity;
  let next = previous;
  if (mode === "set") next = Math.max(0, amount);
  else if (mode === "increase") next = previous + Math.max(0, amount);
  else if (mode === "decrease") next = Math.max(0, previous - Math.max(0, amount));

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: next },
    }),
    prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: owner.id,
        standId: product.standId,
        changeQuantity: next - previous,
        previousQuantity: previous,
        newQuantity: next,
        reason: reason || "Manual adjustment",
        source: InventorySource.OWNER_MANUAL,
      },
    }),
  ]);

  if (next <= product.lowStockThreshold) {
    try {
      await notifyLowStockForProducts(
        [product.id],
        owner.id,
        product.standId,
      );
    } catch (error) {
      console.error("Low-stock notify after inventory adjust failed", error);
    }
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  return { ok: true as const };
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const { owner } = await requireOwner();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      include: { stand: { select: { slug: true } } },
    });
    if (!product) return { error: "Product not found." };

    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
        price: z.string().min(1),
        lowStockThreshold: z.coerce.number().int().min(0),
      })
      .safeParse({
        name: formData.get("name"),
        description: formData.get("description") || undefined,
        price: formData.get("price"),
        lowStockThreshold: formData.get("lowStockThreshold") || 0,
      });
    if (!parsed.success) return { error: "Check product details." };

    let priceCents: number;
    try {
      priceCents = dollarsToCents(parsed.data.price);
    } catch {
      return { error: "Invalid price." };
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        priceCents,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/s/${product.stand.slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("updateProduct failed", error);
    return { error: "Could not save product." };
  }
}

/** Remove a product from the catalog. Hard-deletes if never sold; otherwise archives. */
export async function deleteProduct(productId: string) {
  const { owner } = await requireOwner();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) return { error: "Product not found." };

  if (product._count.orderItems > 0) {
    await prisma.product.update({
      where: { id: product.id },
      data: { isActive: false, stockQuantity: 0 },
    });
  } else {
    await prisma.$transaction([
      prisma.inventoryAdjustment.deleteMany({ where: { productId: product.id } }),
      prisma.lowStockAlert.deleteMany({ where: { productId: product.id } }),
      prisma.product.delete({ where: { id: product.id } }),
    ]);
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/stands/${product.standId}`);
  return { ok: true as const };
}

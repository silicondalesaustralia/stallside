"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { InventorySource } from "@/generated/prisma/client";
import { notifyLowStockForProducts } from "@/lib/notify";
import { uploadProductImage } from "@/lib/product-image-upload";
import {
  isReservedProductSlug,
  slugify,
  uniqueProductSlug,
} from "@/lib/slug";
import { archiveProduct } from "./product-lifecycle-actions";
import { parseTiersFromForm } from "@/lib/price-tiers";
import { Prisma } from "@/generated/prisma/client";
import { markFirstProductLive } from "@/lib/signup-timing";
import {
  addonDefaultsFromProduct,
  upsertPreOrderAddonProduct,
} from "@/lib/preorder-upsell-addon";
import { parseProductOwnerMeta } from "@/lib/product-owner-meta";

const productSchema = z.object({
  standId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  price: z.string().min(1),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  slug: z.string().trim().max(60).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

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

export async function createProduct(formData: FormData) {
  const { owner } = await requireOwner();
  const parsed = productSchema.safeParse({
    standId: formData.get("standId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stockQuantity: formData.get("stockQuantity") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    slug: formData.get("slug") || undefined,
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
  });
  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message;
    return {
      error: detail
        ? `Check product details (${detail}).`
        : "Check product details.",
    };
  }

  const stand = await prisma.stand.findFirst({
    where: { id: parsed.data.standId, ownerId: owner.id },
  });
  if (!stand) {
    return { error: "Stand not found." };
  }

  const preOrderEligible = formData.get("preOrderEligible") === "on";

  let priceCents: number;
  try {
    priceCents = dollarsToCents(parsed.data.price);
  } catch {
    return { error: "Invalid price." };
  }

  const ownerMeta = parseProductOwnerMeta(formData);
  if (!ownerMeta.ok) return { error: ownerMeta.error };

  const slugBase = parsed.data.slug?.trim() || parsed.data.name;
  const slug = await uniqueProductSlug(stand.id, slugBase, (sid, s) =>
    productSlugExists(sid, s),
  );

  const product = await prisma.product.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      priceCents,
      sku: ownerMeta.data.sku,
      upc: ownerMeta.data.upc,
      costCents: ownerMeta.data.costCents,
      currency: stand.currency,
      stockQuantity: parsed.data.stockQuantity,
      lowStockThreshold: parsed.data.lowStockThreshold,
      isActive: true,
      isHidden: false,
      isArchived: false,
      preOrderEligible,
      isPreOrder: false,
    },
  });

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const imageUrl = await uploadProductImage(stand.id, product.id, imageFile);
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl },
      });
    } catch (error) {
      console.error("Product image upload failed", error);
    }
  }

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

  await markFirstProductLive(owner.id);

  revalidatePath("/dashboard/products");
  revalidatePath(`/s/${stand.slug}`);
  redirect(`/dashboard/products/${product.id}`);
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

  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const { owner } = await requireOwner();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      include: {
        stand: { select: { slug: true } },
        optionGroups: { select: { id: true } },
      },
    });
    if (!product) return { error: "Product not found." };

    const tiersParsed = parseTiersFromForm(formData);
    if (!tiersParsed.ok) return { error: tiersParsed.error };
    if (tiersParsed.tiers.length > 0 && product.optionGroups.length > 0) {
      return {
        error: "Clear product options before setting volume prices.",
      };
    }

    const freshnessNote = String(formData.get("freshnessNote") ?? "")
      .trim()
      .slice(0, 80);

    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
        price: z.string().min(1),
        lowStockThreshold: z.coerce.number().int().min(0),
        slug: z.string().trim().min(1).max(60),
        seoTitle: z.string().trim().max(120).optional(),
        seoDescription: z.string().trim().max(300).optional(),
      })
      .safeParse({
        name: formData.get("name"),
        description: formData.get("description") || undefined,
        price: formData.get("price"),
        lowStockThreshold: formData.get("lowStockThreshold") || 0,
        slug: formData.get("slug") || product.slug,
        seoTitle: formData.get("seoTitle") || undefined,
        seoDescription: formData.get("seoDescription") || undefined,
      });
    if (!parsed.success) {
      const detail = parsed.error.issues[0]?.message;
      return {
        error: detail
          ? `Check product details (${detail}).`
          : "Check product details.",
      };
    }

    let priceCents: number;
    try {
      priceCents = dollarsToCents(parsed.data.price);
    } catch {
      return { error: "Invalid price." };
    }

    let slug = slugify(parsed.data.slug) || product.slug;
    if (isReservedProductSlug(slug)) {
      return { error: "That URL slug is reserved. Pick another." };
    }
    if (slug !== product.slug) {
      slug = await uniqueProductSlug(
        product.standId,
        slug,
        (sid, s) => productSlugExists(sid, s, product.id),
      );
    }

    let imageUrl: string | null = product.imageUrl;
    if (formData.get("clearImage") === "on") {
      imageUrl = null;
    } else {
      const imageFile = formData.get("image");
      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await uploadProductImage(
          product.standId,
          product.id,
          imageFile,
        );
      }
    }

    const upsellProductId =
      String(formData.get("upsellProductId") ?? "").trim() || null;
    if (upsellProductId) {
      if (upsellProductId === product.id) {
        return { error: "A product cannot upsell itself." };
      }
      const upsell = await prisma.product.findFirst({
        where: {
          id: upsellProductId,
          standId: product.standId,
          ownerId: owner.id,
          isArchived: false,
          isHidden: false,
        },
        select: { id: true },
      });
      if (!upsell) return { error: "Upsell product not found on this business." };
    }
    let upsellPriceCents: number | null = null;
    const upsellPriceRaw = String(formData.get("upsellPrice") ?? "").trim();
    if (upsellPriceRaw) {
      try {
        upsellPriceCents = dollarsToCents(upsellPriceRaw);
      } catch {
        return { error: "Invalid upsell price." };
      }
    }

    const ownerMeta = parseProductOwnerMeta(formData);
    if (!ownerMeta.ok) return { error: ownerMeta.error };

    const preOrderEligible = formData.get("preOrderEligible") === "on";
    if (!preOrderEligible) {
      const onPage = await prisma.preOrderPageProduct.findFirst({
        where: { productId: product.id },
        select: { id: true },
      });
      if (onPage) {
        return {
          error:
            "Remove this product from its pre-order page(s) before turning off pre-order availability.",
        };
      }
    }

    if (product.preOrderUpsellProductId) {
      await upsertPreOrderAddonProduct({
        standId: product.standId,
        ownerId: owner.id,
        existingProductId: product.preOrderUpsellProductId,
        name: null,
        priceCents: null,
        defaults: addonDefaultsFromProduct(product),
      });
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        slug,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        imageUrl,
        priceCents,
        sku: ownerMeta.data.sku,
        upc: ownerMeta.data.upc,
        costCents: ownerMeta.data.costCents,
        lowStockThreshold: parsed.data.lowStockThreshold,
        freshnessNote: freshnessNote || null,
        upsellProductId: preOrderEligible ? null : upsellProductId,
        upsellPriceCents: preOrderEligible ? null : upsellPriceCents,
        preOrderEligible,
        ...(preOrderEligible
          ? {}
          : {
              isPreOrder: false,
              orderByAt: null,
              collectionAt: null,
              collectionNote: null,
              paymentTiming: "PAY_NOW" as const,
              depositPercent: null,
              handoverMode: "COLLECT" as const,
            }),
        preOrderUpsellName: null,
        preOrderUpsellPriceCents: null,
        preOrderUpsellDiscountKind: null,
        preOrderUpsellDiscountValue: null,
        preOrderUpsellProductId: null,
        priceTiers:
          tiersParsed.tiers.length > 0
            ? tiersParsed.tiers
            : Prisma.DbNull,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/dashboard/businesses/${product.standId}`);
    revalidatePath("/dashboard/pre-order-pages");
    revalidatePath(`/s/${product.stand.slug}`);
    revalidatePath(`/s/${product.stand.slug}/${slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("updateProduct failed", error);
    const message =
      error instanceof Error ? error.message : "Could not save product.";
    return { error: message };
  }
}

/** Prefer archiveProduct - kept for older callers. */
export async function deleteProduct(productId: string) {
  return archiveProduct(productId);
}

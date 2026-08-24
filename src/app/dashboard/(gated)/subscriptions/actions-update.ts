"use server";

import { revalidatePath } from "next/cache";
import { HandoverMode, ShopperSubInterval } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isStripeConfigured } from "@/lib/stripe";
import { syncOfferStripePrice } from "@/lib/shopper-subscription-stripe";
import { parseShopperSubInterval } from "@/lib/subscription-offer";

function productRowsFromForm(formData: FormData): {
  productId: string;
  quantity: number;
}[] {
  const ids = formData.getAll("productIds").map(String);
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  return unique.map((productId) => {
    const raw = String(formData.get(`qty_${productId}`) ?? "1");
    const quantity = Math.max(1, Math.min(99, Number.parseInt(raw, 10) || 1));
    return { productId, quantity };
  });
}

export async function updateSubscriptionOffer(
  offerId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId: owner.id },
    include: { items: true },
  });
  if (!existing) return { error: "Offer not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2-120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const interval = parseShopperSubInterval(formData.get("interval"));
  if (!interval) return { error: "Choose a billing interval." };

  const handoverRaw = String(formData.get("handoverMode") ?? "COLLECT");
  const handoverMode =
    handoverRaw === "DELIVER" ? HandoverMode.DELIVER : HandoverMode.COLLECT;
  const weekdayRaw = String(formData.get("collectionWeekday") ?? "").trim();
  const collectionWeekday =
    weekdayRaw === ""
      ? null
      : Math.max(0, Math.min(6, Number.parseInt(weekdayRaw, 10)));
  const collectionNote =
    String(formData.get("collectionNote") ?? "").trim().slice(0, 200) || null;
  const isActive = formData.get("isActive") === "on";

  const rows = productRowsFromForm(formData);
  if (rows.length < 1) return { error: "Select at least one product." };

  const products = await prisma.product.findMany({
    where: {
      id: { in: rows.map((r) => r.productId) },
      standId: existing.standId,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
    },
  });
  if (products.length !== rows.length) {
    return { error: "One or more products are invalid." };
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const priceCents = rows.reduce((sum, r) => {
    const p = byId.get(r.productId)!;
    return sum + p.priceCents * r.quantity;
  }, 0);
  if (priceCents < 50) {
    return { error: "Subscription total must be at least $0.50." };
  }

  let slug = existing.slug;
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (slugInput) {
    const candidate = slugify(slugInput) || existing.slug;
    const clash = await prisma.subscriptionOffer.findFirst({
      where: {
        standId: existing.standId,
        slug: candidate,
        NOT: { id: existing.id },
      },
      select: { id: true },
    });
    if (clash) return { error: "That URL slug is already in use." };
    slug = candidate;
  }

  const priceChanged =
    priceCents !== existing.priceCents ||
    interval !== existing.interval ||
    title !== existing.title;
  const needsStripeSync = !existing.stripePriceId || priceChanged;

  await prisma.$transaction(async (tx) => {
    await tx.subscriptionOfferProduct.deleteMany({
      where: { subscriptionOfferId: existing.id },
    });
    await tx.subscriptionOffer.update({
      where: { id: existing.id },
      data: {
        title,
        slug,
        description,
        isActive,
        interval: interval as ShopperSubInterval,
        handoverMode,
        collectionWeekday:
          collectionWeekday != null && Number.isFinite(collectionWeekday)
            ? collectionWeekday
            : null,
        collectionNote,
        priceCents,
        items: {
          create: rows.map((r, i) => ({
            productId: r.productId,
            quantity: r.quantity,
            sortOrder: i,
          })),
        },
      },
    });
  });

  if (
    needsStripeSync &&
    isStripeConfigured() &&
    owner.stripeAccountId &&
    owner.stripeChargesEnabled
  ) {
    try {
      const synced = await syncOfferStripePrice({
        stripeAccountId: owner.stripeAccountId,
        title,
        currency: existing.currency,
        priceCents,
        interval,
        existingProductId: existing.stripeProductId,
        existingPriceId: existing.stripePriceId,
      });
      await prisma.subscriptionOffer.update({
        where: { id: existing.id },
        data: {
          stripeProductId: synced.productId,
          stripePriceId: synced.priceId,
        },
      });
    } catch (error) {
      console.error("Stripe price sync failed on update", error);
      return {
        error: "Saved locally, but Stripe price sync failed. Try again.",
      };
    }
  }

  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${existing.id}`);
  return { ok: true as const };
}

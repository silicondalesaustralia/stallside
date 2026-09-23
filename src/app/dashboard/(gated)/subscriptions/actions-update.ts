"use server";

import { revalidatePath } from "next/cache";
import {
  HandoverMode,
  ShopperSubInterval,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isStripeConfigured } from "@/lib/stripe";
import { syncOfferStripePrice } from "@/lib/shopper-subscription-stripe";
import { syncMembershipStripePrices } from "@/lib/membership-subscription-stripe";
import { upsertMembershipFulfilmentProduct } from "@/lib/membership-fulfilment-product";
import { parseShopperSubInterval } from "@/lib/subscription-offer";
import { parseMaxMembers } from "@/lib/subscription-capacity";
import {
  parseOptionalDollarsToCents,
  resolveOfferImageUrl,
} from "./offer-form-helpers";

function productRowsFromForm(formData: FormData) {
  const ids = formData.getAll("productIds").map(String);
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  return unique.map((productId) => {
    const raw = String(formData.get(`qty_${productId}`) ?? "1");
    const quantity = Math.max(1, Math.min(99, Number.parseInt(raw, 10) || 1));
    return { productId, quantity };
  });
}

function handoverFromForm(formData: FormData) {
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
  return {
    handoverMode,
    collectionWeekday:
      collectionWeekday != null && Number.isFinite(collectionWeekday)
        ? collectionWeekday
        : null,
    collectionNote,
  };
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

  if (existing.kind === SubscriptionOfferKind.MEMBERSHIP) {
    return updateMembership(existing, owner, formData);
  }
  return updateBox(existing, owner, formData);
}

async function resolveSlug(
  standId: string,
  offerId: string,
  existingSlug: string,
  formData: FormData,
) {
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (!slugInput) return existingSlug;
  const candidate = slugify(slugInput) || existingSlug;
  const clash = await prisma.subscriptionOffer.findFirst({
    where: { standId, slug: candidate, NOT: { id: offerId } },
    select: { id: true },
  });
  if (clash) return { error: "That URL slug is already in use." as const };
  return candidate;
}

async function updateBox(
  existing: {
    id: string;
    standId: string;
    slug: string;
    title: string;
    priceCents: number;
    interval: ShopperSubInterval;
    currency: string;
    stripeProductId: string | null;
    stripePriceId: string | null;
    imageUrl: string | null;
  },
  owner: {
    id: string;
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
  },
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2-120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const interval = parseShopperSubInterval(formData.get("interval"));
  if (!interval) return { error: "Choose a billing interval." };
  const { handoverMode, collectionWeekday, collectionNote } =
    handoverFromForm(formData);
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

  const slugResult = await resolveSlug(
    existing.standId,
    existing.id,
    existing.slug,
    formData,
  );
  if (typeof slugResult === "object") return slugResult;
  const slug = slugResult;

  const image = await resolveOfferImageUrl({
    formData,
    standId: existing.standId,
    offerId: existing.id,
    existingUrl: existing.imageUrl,
  });
  if (!image.ok) return { error: image.error };

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
        imageUrl: image.imageUrl,
        isActive,
        interval: interval as ShopperSubInterval,
        handoverMode,
        collectionWeekday,
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

async function updateMembership(
  existing: {
    id: string;
    standId: string;
    slug: string;
    title: string;
    currency: string;
    imageUrl: string | null;
    stripeProductId: string | null;
    stripeWeeklyPriceId: string | null;
    stripeMonthlyPriceId: string | null;
    stripeUpfrontPriceId: string | null;
    weeklyPriceCents: number | null;
    monthlyPriceCents: number | null;
    upfrontPriceCents: number | null;
    fulfillmentProductId: string | null;
  },
  owner: {
    id: string;
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
  },
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2-120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 2000) || null;
  const termWeeks = Number.parseInt(String(formData.get("termWeeks") ?? ""), 10);
  if (!Number.isFinite(termWeeks) || termWeeks < 1 || termWeeks > 104) {
    return { error: "Term must be between 1 and 104 weeks." };
  }
  const { handoverMode, collectionWeekday, collectionNote } =
    handoverFromForm(formData);
  const isActive = formData.get("isActive") === "on";

  const maxMembersRaw = parseMaxMembers(formData.get("maxMembers"));
  if (maxMembersRaw && typeof maxMembersRaw === "object" && "error" in maxMembersRaw) {
    return { error: maxMembersRaw.error };
  }
  const maxMembers = typeof maxMembersRaw === "number" ? maxMembersRaw : null;

  const weekly = parseOptionalDollarsToCents(
    formData.get("weeklyPrice"),
    formData.get("enableWeekly") === "on",
  );
  if (weekly && typeof weekly === "object" && "error" in weekly) {
    return { error: weekly.error };
  }
  const monthly = parseOptionalDollarsToCents(
    formData.get("monthlyPrice"),
    formData.get("enableMonthly") === "on",
  );
  if (monthly && typeof monthly === "object" && "error" in monthly) {
    return { error: monthly.error };
  }
  const upfront = parseOptionalDollarsToCents(
    formData.get("upfrontPrice"),
    formData.get("enableUpfront") === "on",
  );
  if (upfront && typeof upfront === "object" && "error" in upfront) {
    return { error: upfront.error };
  }
  const weeklyPriceCents = typeof weekly === "number" ? weekly : null;
  const monthlyPriceCents = typeof monthly === "number" ? monthly : null;
  const upfrontPriceCents = typeof upfront === "number" ? upfront : null;
  if (
    weeklyPriceCents == null &&
    monthlyPriceCents == null &&
    upfrontPriceCents == null
  ) {
    return { error: "Enable at least one payment plan." };
  }

  const slugResult = await resolveSlug(
    existing.standId,
    existing.id,
    existing.slug,
    formData,
  );
  if (typeof slugResult === "object") return slugResult;

  const image = await resolveOfferImageUrl({
    formData,
    standId: existing.standId,
    offerId: existing.id,
    existingUrl: existing.imageUrl,
  });
  if (!image.ok) return { error: image.error };

  const displayCents =
    weeklyPriceCents ?? monthlyPriceCents ?? upfrontPriceCents ?? 0;

  const fulfillmentProductId = await upsertMembershipFulfilmentProduct({
    standId: existing.standId,
    ownerId: owner.id,
    existingProductId: existing.fulfillmentProductId,
    title,
    priceCents: weeklyPriceCents ?? displayCents,
    currency: existing.currency,
    handoverMode,
    collectionNote,
  });

  await prisma.$transaction(async (tx) => {
    await tx.subscriptionOfferProduct.deleteMany({
      where: { subscriptionOfferId: existing.id },
    });
    await tx.subscriptionOffer.update({
      where: { id: existing.id },
      data: {
        title,
        slug: slugResult,
        description,
        imageUrl: image.imageUrl,
        isActive,
        handoverMode,
        collectionWeekday,
        collectionNote,
        priceCents: displayCents,
        termWeeks,
        maxMembers,
        weeklyPriceCents,
        monthlyPriceCents,
        upfrontPriceCents,
        upfrontBenefitsText:
          String(formData.get("upfrontBenefitsText") ?? "")
            .trim()
            .slice(0, 2000) || null,
        termsText:
          String(formData.get("termsText") ?? "").trim().slice(0, 5000) || null,
        fulfillmentProductId,
        items: {
          create: [
            { productId: fulfillmentProductId, quantity: 1, sortOrder: 0 },
          ],
        },
      },
    });
  });

  const pricesChanged =
    weeklyPriceCents !== existing.weeklyPriceCents ||
    monthlyPriceCents !== existing.monthlyPriceCents ||
    upfrontPriceCents !== existing.upfrontPriceCents ||
    title !== existing.title;
  const missingStripe =
    (weeklyPriceCents != null && !existing.stripeWeeklyPriceId) ||
    (monthlyPriceCents != null && !existing.stripeMonthlyPriceId) ||
    (upfrontPriceCents != null && !existing.stripeUpfrontPriceId);

  if (
    (pricesChanged || missingStripe) &&
    isStripeConfigured() &&
    owner.stripeAccountId &&
    owner.stripeChargesEnabled
  ) {
    try {
      const synced = await syncMembershipStripePrices({
        stripeAccountId: owner.stripeAccountId,
        title,
        currency: existing.currency,
        existingProductId: existing.stripeProductId,
        weeklyPriceCents,
        monthlyPriceCents,
        upfrontPriceCents,
        existingWeeklyPriceId: existing.stripeWeeklyPriceId,
        existingMonthlyPriceId: existing.stripeMonthlyPriceId,
        existingUpfrontPriceId: existing.stripeUpfrontPriceId,
      });
      await prisma.subscriptionOffer.update({
        where: { id: existing.id },
        data: {
          stripeProductId: synced.productId,
          stripeWeeklyPriceId: synced.weeklyPriceId,
          stripeMonthlyPriceId: synced.monthlyPriceId,
          stripeUpfrontPriceId: synced.upfrontPriceId,
          stripePriceId: synced.weeklyPriceId ?? synced.monthlyPriceId,
        },
      });
    } catch (error) {
      console.error("Membership Stripe sync failed on update", error);
      return {
        error: "Saved locally, but Stripe price sync failed. Try again.",
      };
    }
  }

  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${existing.id}`);
  return { ok: true as const };
}

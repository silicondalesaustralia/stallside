"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  HandoverMode,
  ShopperSubInterval,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { isStripeConfigured } from "@/lib/stripe";
import { syncOfferStripePrice } from "@/lib/shopper-subscription-stripe";
import { syncMembershipStripePrices } from "@/lib/membership-subscription-stripe";
import { upsertMembershipFulfilmentProduct } from "@/lib/membership-fulfilment-product";
import { parseShopperSubInterval } from "@/lib/subscription-offer";
import {
  parseOptionalDollarsToCents,
  resolveOfferImageUrl,
} from "./offer-form-helpers";

async function uniqueOfferSlug(
  standId: string,
  base: string,
  excludeId?: string,
) {
  let root = slugify(base) || "subscription";
  if (root === "cart" || root === "checkout" || root === "pre" || root === "sub") {
    root = `${root}-offer`;
  }
  const taken = async (slug: string) => {
    const hit = await prisma.subscriptionOffer.findFirst({
      where: {
        standId,
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(hit);
  };
  if (!(await taken(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("Could not allocate a slug");
}

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

export async function createSubscriptionOffer(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Create a business first." };

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { id: true, slug: true, currency: true },
  });
  if (!stand) return { error: "Create a business first." };

  const kindRaw = String(formData.get("kind") ?? "BOX").toUpperCase();
  const kind =
    kindRaw === "MEMBERSHIP"
      ? SubscriptionOfferKind.MEMBERSHIP
      : SubscriptionOfferKind.BOX;

  if (kind === SubscriptionOfferKind.MEMBERSHIP) {
    return createMembershipOffer(formData, owner, stand);
  }
  return createBoxOffer(formData, owner, stand);
}

async function createBoxOffer(
  formData: FormData,
  owner: {
    id: string;
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
  },
  stand: { id: string; slug: string; currency: string },
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
      standId: stand.id,
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

  const slug = await uniqueOfferSlug(
    stand.id,
    String(formData.get("slug") ?? "").trim() || title,
  );

  const offer = await prisma.subscriptionOffer.create({
    data: {
      standId: stand.id,
      ownerId: owner.id,
      kind: SubscriptionOfferKind.BOX,
      title,
      slug,
      description,
      isActive,
      interval: interval as ShopperSubInterval,
      handoverMode,
      collectionWeekday,
      collectionNote,
      priceCents,
      currency: stand.currency,
      items: {
        create: rows.map((r, i) => ({
          productId: r.productId,
          quantity: r.quantity,
          sortOrder: i,
        })),
      },
    },
  });

  const image = await resolveOfferImageUrl({
    formData,
    standId: stand.id,
    offerId: offer.id,
    existingUrl: null,
  });
  if (!image.ok) return { error: image.error };
  if (image.imageUrl) {
    await prisma.subscriptionOffer.update({
      where: { id: offer.id },
      data: { imageUrl: image.imageUrl },
    });
  }


  try {
    if (
      isStripeConfigured() &&
      owner.stripeAccountId &&
      owner.stripeChargesEnabled
    ) {
      const synced = await syncOfferStripePrice({
        stripeAccountId: owner.stripeAccountId,
        title,
        currency: stand.currency,
        priceCents,
        interval,
        existingProductId: null,
        existingPriceId: null,
      });
      await prisma.subscriptionOffer.update({
        where: { id: offer.id },
        data: {
          stripeProductId: synced.productId,
          stripePriceId: synced.priceId,
        },
      });
    }
  } catch (error) {
    console.error("Stripe price sync failed for new offer", error);
    return {
      error:
        "Offer saved, but Stripe price sync failed. Connect Stripe and save again.",
    };
  }

  revalidatePath("/dashboard/subscriptions");
  redirect(`/dashboard/subscriptions/${offer.id}`);
}

async function createMembershipOffer(
  formData: FormData,
  owner: {
    id: string;
    stripeAccountId: string | null;
    stripeChargesEnabled: boolean;
  },
  stand: { id: string; slug: string; currency: string },
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

  const upfrontBenefitsText =
    String(formData.get("upfrontBenefitsText") ?? "").trim().slice(0, 2000) ||
    null;
  const termsText =
    String(formData.get("termsText") ?? "").trim().slice(0, 5000) || null;

  const displayCents =
    weeklyPriceCents ??
    monthlyPriceCents ??
    upfrontPriceCents ??
    0;

  const slug = await uniqueOfferSlug(
    stand.id,
    String(formData.get("slug") ?? "").trim() || title,
  );

  const fulfillmentProductId = await upsertMembershipFulfilmentProduct({
    standId: stand.id,
    ownerId: owner.id,
    existingProductId: null,
    title,
    priceCents: weeklyPriceCents ?? displayCents,
    currency: stand.currency,
    handoverMode,
    collectionNote,
  });

  const offer = await prisma.subscriptionOffer.create({
    data: {
      standId: stand.id,
      ownerId: owner.id,
      kind: SubscriptionOfferKind.MEMBERSHIP,
      title,
      slug,
      description,
      isActive,
      interval: ShopperSubInterval.WEEKLY,
      handoverMode,
      collectionWeekday,
      collectionNote,
      priceCents: displayCents,
      currency: stand.currency,
      termWeeks,
      weeklyPriceCents,
      monthlyPriceCents,
      upfrontPriceCents,
      upfrontBenefitsText,
      termsText,
      fulfillmentProductId,
      items: {
        create: [{ productId: fulfillmentProductId, quantity: 1, sortOrder: 0 }],
      },
    },
  });

  const image = await resolveOfferImageUrl({
    formData,
    standId: stand.id,
    offerId: offer.id,
    existingUrl: null,
  });
  if (!image.ok) return { error: image.error };
  if (image.imageUrl) {
    await prisma.subscriptionOffer.update({
      where: { id: offer.id },
      data: { imageUrl: image.imageUrl },
    });
  }


  try {
    if (
      isStripeConfigured() &&
      owner.stripeAccountId &&
      owner.stripeChargesEnabled
    ) {
      const synced = await syncMembershipStripePrices({
        stripeAccountId: owner.stripeAccountId,
        title,
        currency: stand.currency,
        existingProductId: null,
        weeklyPriceCents,
        monthlyPriceCents,
        upfrontPriceCents,
        existingWeeklyPriceId: null,
        existingMonthlyPriceId: null,
        existingUpfrontPriceId: null,
      });
      await prisma.subscriptionOffer.update({
        where: { id: offer.id },
        data: {
          stripeProductId: synced.productId,
          stripeWeeklyPriceId: synced.weeklyPriceId,
          stripeMonthlyPriceId: synced.monthlyPriceId,
          stripeUpfrontPriceId: synced.upfrontPriceId,
          stripePriceId: synced.weeklyPriceId ?? synced.monthlyPriceId,
        },
      });
    }
  } catch (error) {
    console.error("Membership Stripe sync failed", error);
    return {
      error:
        "Offer saved, but Stripe price sync failed. Connect Stripe and save again.",
    };
  }

  revalidatePath("/dashboard/subscriptions");
  redirect(`/dashboard/subscriptions/${offer.id}`);
}

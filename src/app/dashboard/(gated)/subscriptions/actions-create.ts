"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HandoverMode, ShopperSubInterval } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { isStripeConfigured } from "@/lib/stripe";
import { syncOfferStripePrice } from "@/lib/shopper-subscription-stripe";
import { parseShopperSubInterval } from "@/lib/subscription-offer";

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

async function syncStripeIfConnected(params: {
  ownerStripeAccountId: string | null;
  chargesEnabled: boolean;
  offerId: string;
  title: string;
  currency: string;
  priceCents: number;
  interval: NonNullable<ReturnType<typeof parseShopperSubInterval>>;
  existingProductId: string | null;
  existingPriceId: string | null;
}) {
  if (
    !isStripeConfigured() ||
    !params.ownerStripeAccountId ||
    !params.chargesEnabled ||
    !params.interval ||
    params.priceCents <= 0
  ) {
    return;
  }
  const synced = await syncOfferStripePrice({
    stripeAccountId: params.ownerStripeAccountId,
    title: params.title,
    currency: params.currency,
    priceCents: params.priceCents,
    interval: params.interval,
    existingProductId: params.existingProductId,
    existingPriceId: params.existingPriceId,
  });
  await prisma.subscriptionOffer.update({
    where: { id: params.offerId },
    data: {
      stripeProductId: synced.productId,
      stripePriceId: synced.priceId,
    },
  });
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

  try {
    await syncStripeIfConnected({
      ownerStripeAccountId: owner.stripeAccountId,
      chargesEnabled: owner.stripeChargesEnabled,
      offerId: offer.id,
      title,
      currency: stand.currency,
      priceCents,
      interval,
      existingProductId: null,
      existingPriceId: null,
    });
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

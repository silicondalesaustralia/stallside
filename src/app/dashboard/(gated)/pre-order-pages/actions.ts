"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  HandoverMode,
  PaymentTiming,
  type Prisma,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parsePreOrderFromForm } from "@/lib/pre-order";
import { slugify } from "@/lib/slug";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { preOrderPagePath } from "@/lib/preorder-page";
import { parsePreOrderAddonForm } from "@/lib/preorder-addon-form";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import { upsertPreOrderAddonProduct } from "@/lib/preorder-upsell-addon";
import { uploadPreOrderPageImage } from "@/lib/preorder-page-image-upload";

type Tx = Prisma.TransactionClient;

async function resolvePageImageUrl(input: {
  formData: FormData;
  standId: string;
  pageId: string;
  existingUrl: string | null;
}): Promise<{ ok: true; imageUrl: string | null } | { ok: false; error: string }> {
  if (input.formData.get("clearImage") === "on") {
    return { ok: true, imageUrl: null };
  }
  const imageFile = input.formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size <= 0) {
    return { ok: true, imageUrl: input.existingUrl };
  }
  try {
    const imageUrl = await uploadPreOrderPageImage(
      input.standId,
      input.pageId,
      imageFile,
    );
    return { ok: true, imageUrl };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not upload that photo.",
    };
  }
}

async function uniquePageSlug(
  standId: string,
  base: string,
  excludeId?: string,
) {
  let root = slugify(base) || "pre-order";
  if (root === "cart" || root === "checkout" || root === "pre") {
    root = `${root}-page`;
  }
  const taken = async (slug: string) => {
    const hit = await prisma.preOrderPage.findFirst({
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

function productIdsFromForm(formData: FormData): string[] {
  const raw = formData.getAll("productIds").map(String);
  return [...new Set(raw.map((id) => id.trim()).filter(Boolean))];
}

function scheduleFromPre(pre: {
  orderByAt: Date;
  collectionAt: Date;
  collectionNote: string | null;
  showExactStock: boolean;
  paymentTiming: "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";
  depositPercent: number | null;
  handoverMode: "COLLECT" | "DELIVER";
}) {
  return {
    isPreOrder: true as const,
    orderByAt: pre.orderByAt,
    collectionAt: pre.collectionAt,
    collectionNote: pre.collectionNote,
    showExactStock: pre.showExactStock,
    paymentTiming:
      pre.paymentTiming === "DEPOSIT_THEN_BALANCE"
        ? PaymentTiming.DEPOSIT_THEN_BALANCE
        : PaymentTiming.PAY_UPFRONT,
    depositPercent: pre.depositPercent,
    handoverMode:
      pre.handoverMode === "DELIVER"
        ? HandoverMode.DELIVER
        : HandoverMode.COLLECT,
  };
}

async function clearOrphanedPreOrderFlags(
  tx: Tx,
  productIds: string[],
) {
  for (const productId of productIds) {
    const stillOnPage = await tx.preOrderPageProduct.findFirst({
      where: { productId },
      select: { id: true },
    });
    if (stillOnPage) continue;
    await tx.product.update({
      where: { id: productId },
      data: {
        isPreOrder: false,
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        paymentTiming: PaymentTiming.PAY_NOW,
        depositPercent: null,
        handoverMode: HandoverMode.COLLECT,
      },
    });
  }
}

async function resolvePageAddon(input: {
  formData: FormData;
  standId: string;
  ownerId: string;
  currency: string;
  existingProductId: string | null;
  schedule: ReturnType<typeof scheduleFromPre>;
  showExactStock: boolean;
}): Promise<
  | {
      ok: true;
      preOrderUpsellName: string | null;
      preOrderUpsellPriceCents: number | null;
      preOrderUpsellDiscountKind: string | null;
      preOrderUpsellDiscountValue: number | null;
      preOrderUpsellProductId: string | null;
    }
  | { ok: false; error: string }
> {
  const addon = parsePreOrderAddonForm(input.formData);
  if (!addon.ok) return { ok: false, error: addon.error };

  const name = addon.data.name;
  let priceCents = addon.data.priceCents;
  const discountKind = addon.data.discountKind;
  const discountValue = addon.data.discountValue;
  const saleCents =
    name && priceCents != null
      ? resolveAddonPricing(priceCents, discountKind, discountValue).saleCents
      : null;

  const upserted = await upsertPreOrderAddonProduct({
    standId: input.standId,
    ownerId: input.ownerId,
    existingProductId: input.existingProductId,
    name,
    priceCents: saleCents,
    defaults: {
      orderByAt: input.schedule.orderByAt,
      collectionAt: input.schedule.collectionAt,
      collectionNote: input.schedule.collectionNote,
      paymentTiming: input.schedule.paymentTiming,
      depositPercent: input.schedule.depositPercent,
      handoverMode: input.schedule.handoverMode,
      currency: input.currency,
      showExactStock: input.showExactStock,
    },
  });
  if (!upserted.ok) return { ok: false, error: upserted.error };
  if (!name) priceCents = null;

  return {
    ok: true,
    preOrderUpsellName: name,
    preOrderUpsellPriceCents: priceCents,
    preOrderUpsellDiscountKind: name ? discountKind : null,
    preOrderUpsellDiscountValue: name ? discountValue : null,
    preOrderUpsellProductId: upserted.productId,
  };
}

export async function createPreOrderPage(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Create a business first." };

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { id: true, slug: true, currency: true, timezone: true },
  });
  if (!stand) return { error: "Create a business first." };

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  formData.set("isPreOrder", "true");
  const pre = parsePreOrderFromForm(
    formData,
    true,
    stripeConnected,
    stand.timezone,
  );
  if (!pre.ok) return { error: pre.error };
  if (!pre.data.isPreOrder) {
    return { error: "Set order-by and collection times." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2-120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const productIds = productIdsFromForm(formData);
  if (productIds.length < 1) {
    return { error: "Select at least one product." };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      standId: stand.id,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
      preOrderEligible: true,
    },
    select: { id: true },
  });
  if (products.length !== productIds.length) {
    return {
      error:
        "Only products marked “Available for pre-order pages” can be added.",
    };
  }

  const slug = await uniquePageSlug(stand.id, slugInput || title);
  const schedule = scheduleFromPre(pre.data);
  const locationLabel =
    String(formData.get("locationLabel") ?? "").trim().slice(0, 120) || null;

  const addon = await resolvePageAddon({
    formData,
    standId: stand.id,
    ownerId: owner.id,
    currency: stand.currency,
    existingProductId: null,
    schedule,
    showExactStock: schedule.showExactStock,
  });
  if (!addon.ok) return { error: addon.error };

  const page = await prisma.$transaction(async (tx) => {
    await tx.stand.update({
      where: { id: stand.id },
      data: { locationLabel },
    });
    const created = await tx.preOrderPage.create({
      data: {
        standId: stand.id,
        ownerId: owner.id,
        title,
        slug,
        description,
        isActive: formData.get("isActive") === "on",
        hideOnBusinessPage: formData.get("hideOnBusinessPage") === "on",
        orderByAt: schedule.orderByAt,
        collectionAt: schedule.collectionAt,
        collectionNote: schedule.collectionNote,
        showExactStock: schedule.showExactStock,
        paymentTiming: schedule.paymentTiming,
        depositPercent: schedule.depositPercent,
        handoverMode: schedule.handoverMode,
        preOrderUpsellName: addon.preOrderUpsellName,
        preOrderUpsellPriceCents: addon.preOrderUpsellPriceCents,
        preOrderUpsellDiscountKind: addon.preOrderUpsellDiscountKind,
        preOrderUpsellDiscountValue: addon.preOrderUpsellDiscountValue,
        preOrderUpsellProductId: addon.preOrderUpsellProductId,
        items: {
          create: productIds.map((productId, i) => ({
            productId,
            sortOrder: i,
          })),
        },
      },
    });

    await tx.product.updateMany({
      where: { id: { in: productIds }, standId: stand.id },
      data: schedule,
    });

    return created;
  });

  const image = await resolvePageImageUrl({
    formData,
    standId: stand.id,
    pageId: page.id,
    existingUrl: null,
  });
  if (!image.ok) return { error: image.error };
  if (image.imageUrl) {
    await prisma.preOrderPage.update({
      where: { id: page.id },
      data: { imageUrl: image.imageUrl },
    });
  }

  try {
    const { syncPreOrderPageFulfilmentOption } = await import(
      "@/lib/fulfilment/sync-preorder-page"
    );
    await syncPreOrderPageFulfilmentOption(page.id);
  } catch (err) {
    console.error("Pre-order fulfilment sync failed", err);
  }

  revalidatePath("/dashboard/pre-order-pages");
  revalidatePath("/dashboard/products");
  revalidatePath(`/s/${stand.slug}`);
  revalidatePath(preOrderPagePath(stand.slug, page.slug));
  redirect(`/dashboard/pre-order-pages/${page.id}`);
}

export async function updatePreOrderPage(pageId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId: owner.id },
    include: {
      stand: { select: { id: true, slug: true, currency: true, timezone: true } },
      items: { select: { productId: true } },
    },
  });
  if (!existing) return { error: "Pre-order page not found." };

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  formData.set("isPreOrder", "true");
  const pre = parsePreOrderFromForm(
    formData,
    true,
    stripeConnected,
    existing.stand.timezone,
  );
  if (!pre.ok) return { error: pre.error };
  if (!pre.data.isPreOrder) {
    return { error: "Set order-by and collection times." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2-120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const productIds = productIdsFromForm(formData);
  if (productIds.length < 1) {
    return { error: "Select at least one product." };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      standId: existing.standId,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
      preOrderEligible: true,
    },
    select: { id: true },
  });
  if (products.length !== productIds.length) {
    return {
      error:
        "Only products marked “Available for pre-order pages” can be added.",
    };
  }

  let slug = existing.slug;
  const requested = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (requested && requested !== existing.slug) {
    slug = await uniquePageSlug(existing.standId, requested, existing.id);
  }

  const schedule = scheduleFromPre(pre.data);
  const locationLabel =
    String(formData.get("locationLabel") ?? "").trim().slice(0, 120) || null;

  const addon = await resolvePageAddon({
    formData,
    standId: existing.standId,
    ownerId: owner.id,
    currency: existing.stand.currency,
    existingProductId: existing.preOrderUpsellProductId,
    schedule,
    showExactStock: schedule.showExactStock,
  });
  if (!addon.ok) return { error: addon.error };

  const previousIds = existing.items.map((i) => i.productId);
  const removedIds = previousIds.filter((id) => !productIds.includes(id));

  const image = await resolvePageImageUrl({
    formData,
    standId: existing.standId,
    pageId: existing.id,
    existingUrl: existing.imageUrl,
  });
  if (!image.ok) return { error: image.error };

  await prisma.$transaction(async (tx) => {
    await tx.stand.update({
      where: { id: existing.standId },
      data: { locationLabel },
    });
    await tx.preOrderPageProduct.deleteMany({
      where: { preOrderPageId: existing.id },
    });
    await tx.preOrderPage.update({
      where: { id: existing.id },
      data: {
        title,
        slug,
        description,
        imageUrl: image.imageUrl,
        isActive: formData.get("isActive") === "on",
        hideOnBusinessPage: formData.get("hideOnBusinessPage") === "on",
        orderByAt: schedule.orderByAt,
        collectionAt: schedule.collectionAt,
        collectionNote: schedule.collectionNote,
        showExactStock: schedule.showExactStock,
        paymentTiming: schedule.paymentTiming,
        depositPercent: schedule.depositPercent,
        handoverMode: schedule.handoverMode,
        preOrderUpsellName: addon.preOrderUpsellName,
        preOrderUpsellPriceCents: addon.preOrderUpsellPriceCents,
        preOrderUpsellDiscountKind: addon.preOrderUpsellDiscountKind,
        preOrderUpsellDiscountValue: addon.preOrderUpsellDiscountValue,
        preOrderUpsellProductId: addon.preOrderUpsellProductId,
        items: {
          create: productIds.map((productId, i) => ({
            productId,
            sortOrder: i,
          })),
        },
      },
    });
    await tx.product.updateMany({
      where: { id: { in: productIds }, standId: existing.standId },
      data: schedule,
    });
    await clearOrphanedPreOrderFlags(tx, removedIds);
  });

  try {
    const { syncPreOrderPageFulfilmentOption } = await import(
      "@/lib/fulfilment/sync-preorder-page"
    );
    await syncPreOrderPageFulfilmentOption(existing.id);
  } catch (err) {
    console.error("Pre-order fulfilment sync failed", err);
  }

  revalidatePath("/dashboard/pre-order-pages");
  revalidatePath(`/dashboard/pre-order-pages/${existing.id}`);
  revalidatePath(`/dashboard/pre-order-pages/${existing.id}/qr`);
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/businesses/${existing.standId}`);
  revalidatePath(`/s/${existing.stand.slug}`);
  revalidatePath(preOrderPagePath(existing.stand.slug, existing.slug));
  if (slug !== existing.slug) {
    revalidatePath(preOrderPagePath(existing.stand.slug, slug));
  }
  redirect(`/dashboard/pre-order-pages/${existing.id}?saved=1`);
}

export async function deletePreOrderPage(pageId: string) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId: owner.id },
    include: {
      stand: { select: { slug: true, currency: true, id: true } },
      items: { select: { productId: true } },
    },
  });
  if (!existing) {
    redirect("/dashboard/pre-order-pages");
  }

  const productIds = existing.items.map((i) => i.productId);

  if (existing.preOrderUpsellProductId) {
    await upsertPreOrderAddonProduct({
      standId: existing.stand.id,
      ownerId: owner.id,
      existingProductId: existing.preOrderUpsellProductId,
      name: null,
      priceCents: null,
      defaults: {
        orderByAt: null,
        collectionAt: null,
        collectionNote: null,
        paymentTiming: PaymentTiming.PAY_UPFRONT,
        depositPercent: null,
        handoverMode: HandoverMode.COLLECT,
        currency: existing.stand.currency,
        showExactStock: false,
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.preOrderPage.delete({ where: { id: existing.id } });
    await clearOrphanedPreOrderFlags(tx, productIds);
  });

  revalidatePath("/dashboard/pre-order-pages");
  revalidatePath("/dashboard/products");
  revalidatePath(preOrderPagePath(existing.stand.slug, existing.slug));
  redirect("/dashboard/pre-order-pages");
}

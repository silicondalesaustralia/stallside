"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/constants";
import {
  DEFAULT_TIMEZONE,
  STAND_TIMEZONES,
  resolveStandTimezone,
} from "@/lib/stand-timezone";
import { uniqueStandSlug } from "@/lib/slug";
import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { brandingDataFromForm } from "./stand-branding-from-form";
import { dollarsToCents } from "@/lib/money";
import { upsertPreOrderAddonProduct } from "@/lib/preorder-upsell-addon";
import { CartMode, HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import { writeSelectedBusinessCookie } from "@/lib/selected-business";
import {
  archiveCustomerChoiceProduct,
  ensureCustomerChoiceProduct,
} from "@/lib/customer-choice-product";

const timezoneValues = STAND_TIMEZONES.map((z) => z.value) as [
  string,
  ...string[],
];

const standSchema = z.object({
  name: z.string().trim().min(2).max(80),
  // Align with QR print editor (HTML instructions can exceed plain-text length).
  description: z.string().trim().max(8000).optional(),
  locationLabel: z.string().trim().max(120).optional(),
  currency: z.enum(CURRENCIES),
  timezone: z.enum(timezoneValues),
  showExactStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function createStand(formData: FormData) {
  // Guard: other stand forms share field names; only New stand may create.
  if (formData.get("intent") !== "create") {
    throw new Error("Invalid create request.");
  }

  const { owner } = await requireOwnerWrite();

  const parsed = standSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    currency: formData.get("currency") || "AUD",
    timezone: resolveStandTimezone(
      String(formData.get("timezone") ?? DEFAULT_TIMEZONE),
    ),
    showExactStock: formData.get("showExactStock") === "on",
    isActive: true,
  });
  if (!parsed.success) {
    throw new Error("Check stand details and try again.");
  }

  const slug = await uniqueStandSlug(parsed.data.name, async (s) => {
    const found = await prisma.stand.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const stand = await prisma.stand.create({
    data: {
      ownerId: owner.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      locationLabel: parsed.data.locationLabel,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      showExactStock: parsed.data.showExactStock ?? false,
      isActive: true,
    },
  });

  await writeSelectedBusinessCookie(stand.id);
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/businesses");
  redirect(`/dashboard/businesses/${stand.id}?new=1`);
}

export async function updateStand(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  const section = String(formData.get("section") ?? "details").trim();

  if (section === "branding") {
    const brandingPatch = await brandingDataFromForm(existing, formData);
    if (!brandingPatch.ok) return { error: brandingPatch.error };
    await prisma.stand.update({
      where: { id: standId },
      data: brandingPatch.data,
    });
    revalidateStandPaths(standId, existing.slug, existing.slug);
    return { ok: true as const };
  }

  if (section === "conversion") {
    const conversionPatch = await parseConversionPatch(formData, standId, owner.id);
    if ("error" in conversionPatch) return conversionPatch;

    if (existing.preOrderUpsellProductId) {
      await upsertPreOrderAddonProduct({
        standId,
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
          currency: existing.currency,
          showExactStock: existing.showExactStock,
        },
      });
    }

    await prisma.stand.update({
      where: { id: standId },
      data: {
        ...conversionPatch,
        preOrderUpsellName: null,
        preOrderUpsellPriceCents: null,
        preOrderUpsellDiscountKind: null,
        preOrderUpsellDiscountValue: null,
        preOrderUpsellProductId: null,
      },
    });
    revalidateStandPaths(standId, existing.slug, existing.slug);
    return { ok: true as const };
  }

  // Always read as strings - empty must become null in Prisma (undefined = skip).
  const description = String(formData.get("description") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();

  const parsed = standSchema.safeParse({
    name: formData.get("name"),
    description: description || undefined,
    locationLabel: locationLabel || undefined,
    currency: formData.get("currency") ?? existing.currency,
    timezone: resolveStandTimezone(
      String(formData.get("timezone") ?? existing.timezone ?? DEFAULT_TIMEZONE),
    ),
    showExactStock: formData.get("showExactStock") === "on",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message;
    return {
      error: detail
        ? `Check business details (${detail}).`
        : "Check business details and try again.",
    };
  }

  let slug = existing.slug;
  const requestedSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (requestedSlug && requestedSlug !== existing.slug) {
    const taken = await prisma.stand.findFirst({
      where: { slug: requestedSlug, NOT: { id: standId } },
    });
    if (taken) return { error: "That slug is already taken." };
    slug = requestedSlug;
  }

  const method = localTransferForCurrency(parsed.data.currency);
  const clearLocal = !method;

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      slug,
      description: description || null,
      locationLabel: locationLabel || null,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      ...(clearLocal
        ? {
            localTransferAlias: null,
            localTransferMethodId: null,
            acceptLocalTransfer: false,
          }
        : {}),
      showExactStock: parsed.data.showExactStock ?? false,
      isActive: parsed.data.isActive ?? true,
    },
  });

  revalidateStandPaths(standId, slug, existing.slug);
  return { ok: true as const };
}

function revalidateStandPaths(
  standId: string,
  slug: string,
  previousSlug: string,
) {
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/dashboard/businesses/${standId}/qr`);
  revalidatePath(`/s/${slug}`);
  revalidateTag(standCatalogTag(slug), "max");
  if (slug !== previousSlug) {
    revalidatePath(`/s/${previousSlug}`);
    revalidateTag(standCatalogTag(previousSlug), "max");
  }
}

async function parseConversionPatch(
  formData: FormData,
  standId: string,
  ownerId: string,
) {
  const upsellProductId =
    String(formData.get("upsellProductId") ?? "").trim() || null;
  if (upsellProductId) {
    const upsell = await prisma.product.findFirst({
      where: {
        id: upsellProductId,
        standId,
        ownerId,
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

  let firstOrderDiscountAmountCents: number | null = null;
  const amountRaw = String(
    formData.get("firstOrderDiscountAmount") ?? "",
  ).trim();
  if (amountRaw) {
    try {
      firstOrderDiscountAmountCents = dollarsToCents(amountRaw);
    } catch {
      return { error: "Invalid first-order amount." };
    }
  }
  const percent = Number.parseInt(
    String(formData.get("firstOrderDiscountPercent") ?? "10"),
    10,
  );
  return {
    upsellProductId,
    upsellPriceCents,
    firstOrderDiscountEnabled:
      formData.get("firstOrderDiscountEnabled") === "on",
    firstOrderDiscountPercent:
      Number.isInteger(percent) && percent >= 0 && percent <= 100
        ? percent
        : 10,
    firstOrderDiscountAmountCents,
    showPublicScarcity: formData.get("showPublicScarcity") === "on",
  };
}

/** Update fields shown on the printable / downloadable QR sign. */
export async function updateStandQrPrint(standId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  const printSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(8000).optional(),
    locationLabel: z.string().trim().max(120).optional(),
    qrSignMessage: z.string().trim().max(8000).optional(),
    qrCallout: z.string().trim().max(8000).optional(),
    cartMode: z.enum(["PRODUCT", "CUSTOMER_CHOICE"]),
  });

  const parsed = printSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    qrSignMessage: formData.get("qrSignMessage") || undefined,
    qrCallout: formData.get("qrCallout") || undefined,
    cartMode: formData.get("cartMode") || "PRODUCT",
  });
  if (!parsed.success) return { error: "Check the print details and try again." };

  const instructions = parsed.data.description
    ? sanitizeSignHtml(parsed.data.description, true)
    : "";
  const signMessage = parsed.data.qrSignMessage
    ? sanitizeSignHtml(parsed.data.qrSignMessage, true)
    : "";
  const callout = parsed.data.qrCallout
    ? sanitizeSignHtml(parsed.data.qrCallout, true)
    : "";

  const nextMode =
    parsed.data.cartMode === "CUSTOMER_CHOICE"
      ? CartMode.CUSTOMER_CHOICE
      : CartMode.PRODUCT;

  let customerChoiceProductId = existing.customerChoiceProductId;
  if (nextMode === CartMode.CUSTOMER_CHOICE) {
    const ensured = await ensureCustomerChoiceProduct({
      standId,
      ownerId: owner.id,
      currency: existing.currency,
      existingProductId: existing.customerChoiceProductId,
    });
    if (!ensured.ok) return { error: ensured.error };
    customerChoiceProductId = ensured.productId;
  } else if (
    existing.cartMode === CartMode.CUSTOMER_CHOICE &&
    existing.customerChoiceProductId
  ) {
    await archiveCustomerChoiceProduct(
      standId,
      existing.customerChoiceProductId,
    );
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      description: instructions || null,
      locationLabel: parsed.data.locationLabel || null,
      qrSignMessage: signMessage || null,
      qrCallout: callout || null,
      cartMode: nextMode,
      customerChoiceProductId,
      posterShowCta: formData.get("posterShowCta") === "on",
      posterCtaText:
        String(formData.get("posterCtaText") ?? "")
          .trim()
          .slice(0, 60) || null,
      posterShowBundles: formData.get("posterShowBundles") === "on",
      posterShowFirstOrder: formData.get("posterShowFirstOrder") === "on",
      posterShowInstructions: formData.get("posterShowInstructions") === "on",
      posterShowFreshness: formData.get("posterShowFreshness") === "on",
      posterShowHowItWorks: formData.get("posterShowHowItWorks") === "on",
    },
  });

  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath(`/dashboard/businesses/${standId}/qr`);
  revalidatePath(`/s/${existing.slug}`);
  revalidateTag(standCatalogTag(existing.slug), "max");
  revalidatePath(`/s/${existing.slug}/pay`);
  return { ok: true as const };
}

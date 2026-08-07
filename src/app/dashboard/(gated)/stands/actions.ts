"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/constants";
import { uniqueStandSlug } from "@/lib/slug";
import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { brandingDataFromForm } from "./stand-branding-from-form";
import { dollarsToCents } from "@/lib/money";

const standSchema = z.object({
  name: z.string().trim().min(2).max(80),
  // Align with QR print editor (HTML instructions can exceed plain-text length).
  description: z.string().trim().max(8000).optional(),
  locationLabel: z.string().trim().max(120).optional(),
  currency: z.enum(CURRENCIES),
  showExactStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function createStand(formData: FormData) {
  // Guard: other stand forms share field names; only New stand may create.
  if (formData.get("intent") !== "create") {
    throw new Error("Invalid create request.");
  }

  const { owner } = await requireOwner();
  const parsed = standSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    currency: formData.get("currency") || "AUD",
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
      showExactStock: parsed.data.showExactStock ?? false,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/stands");
  redirect(`/dashboard/stands/${stand.id}`);
}

export async function updateStand(standId: string, formData: FormData) {
  const { owner, user } = await requireOwner();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  // Always read as strings - empty must become null in Prisma (undefined = skip).
  const description = String(formData.get("description") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();

  const parsed = standSchema.safeParse({
    name: formData.get("name"),
    description: description || undefined,
    locationLabel: locationLabel || undefined,
    currency: formData.get("currency") || existing.currency,
    showExactStock: formData.get("showExactStock") === "on",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message;
    return {
      error: detail
        ? `Check stand details (${detail}).`
        : "Check stand details and try again.",
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

  let brandingPatch: Awaited<ReturnType<typeof brandingDataFromForm>> | null =
    null;
  if (formData.get("includeBranding") === "1") {
    brandingPatch = await brandingDataFromForm(existing, formData);
    if (!brandingPatch.ok) return { error: brandingPatch.error };
  }

  let conversionPatch: {
    upsellProductId: string | null;
    upsellPriceCents: number | null;
    firstOrderDiscountEnabled: boolean;
    firstOrderDiscountPercent: number;
    firstOrderDiscountAmountCents: number | null;
    showPublicScarcity: boolean;
  } | null = null;
  if (formData.get("includeConversion") === "1") {
    const upsellProductId =
      String(formData.get("upsellProductId") ?? "").trim() || null;
    if (upsellProductId) {
      const upsell = await prisma.product.findFirst({
        where: {
          id: upsellProductId,
          standId: standId,
          ownerId: owner.id,
          isArchived: false,
        },
        select: { id: true },
      });
      if (!upsell) return { error: "Upsell product not found on this stand." };
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
    conversionPatch = {
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

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      slug,
      description: description || null,
      locationLabel: locationLabel || null,
      currency: parsed.data.currency,
      ...(clearLocal
        ? {
            localTransferAlias: null,
            localTransferMethodId: null,
            acceptLocalTransfer: false,
          }
        : {}),
      showExactStock: parsed.data.showExactStock ?? false,
      isActive: parsed.data.isActive ?? true,
      ...(brandingPatch?.ok ? brandingPatch.data : {}),
      ...(conversionPatch ?? {}),
    },
  });

  revalidatePath("/dashboard/stands");
  revalidatePath(`/dashboard/stands/${standId}`);
  revalidatePath(`/dashboard/stands/${standId}/qr`);
  revalidatePath(`/s/${slug}`);
  if (slug !== existing.slug) {
    revalidatePath(`/s/${existing.slug}`);
  }
  return { ok: true as const };
}

/** Update fields shown on the printable / downloadable QR sign. */
export async function updateStandQrPrint(standId: string, formData: FormData) {
  const { owner } = await requireOwner();
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
  });

  const parsed = printSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    qrSignMessage: formData.get("qrSignMessage") || undefined,
    qrCallout: formData.get("qrCallout") || undefined,
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

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      description: instructions || null,
      locationLabel: parsed.data.locationLabel || null,
      qrSignMessage: signMessage || null,
      qrCallout: callout || null,
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

  revalidatePath("/dashboard/stands");
  revalidatePath(`/dashboard/stands/${standId}`);
  revalidatePath(`/dashboard/stands/${standId}/qr`);
  revalidatePath(`/s/${existing.slug}`);
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/constants";
import { uniqueStandSlug } from "@/lib/slug";

const standSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  locationLabel: z.string().trim().max(120).optional(),
  currency: z.enum(CURRENCIES),
  showExactStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function createStand(formData: FormData) {
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
  const { owner } = await requireOwner();
  const existing = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
  });
  if (!existing) return { error: "Stand not found." };

  const parsed = standSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    currency: formData.get("currency") || existing.currency,
    showExactStock: formData.get("showExactStock") === "on",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: "Check stand details and try again." };

  let slug = existing.slug;
  const requestedSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (requestedSlug && requestedSlug !== existing.slug) {
    const taken = await prisma.stand.findFirst({
      where: { slug: requestedSlug, NOT: { id: standId } },
    });
    if (taken) return { error: "That slug is already taken." };
    slug = requestedSlug;
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      locationLabel: parsed.data.locationLabel,
      currency: parsed.data.currency,
      showExactStock: parsed.data.showExactStock ?? false,
      isActive: parsed.data.isActive ?? true,
    },
  });

  revalidatePath("/dashboard/stands");
  revalidatePath(`/dashboard/stands/${standId}`);
  revalidatePath(`/dashboard/stands/${standId}/qr`);
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
    description: z.string().trim().max(500).optional(),
    locationLabel: z.string().trim().max(120).optional(),
    qrSignMessage: z.string().trim().max(160).optional(),
  });

  const parsed = printSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    qrSignMessage: formData.get("qrSignMessage") || undefined,
  });
  if (!parsed.success) return { error: "Check the print details and try again." };

  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      locationLabel: parsed.data.locationLabel || null,
      qrSignMessage: parsed.data.qrSignMessage || null,
    },
  });

  revalidatePath("/dashboard/stands");
  revalidatePath(`/dashboard/stands/${standId}`);
  revalidatePath(`/dashboard/stands/${standId}/qr`);
  revalidatePath(`/s/${existing.slug}`);
  return { ok: true as const };
}

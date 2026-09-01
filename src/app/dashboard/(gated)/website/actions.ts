"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  publishStorefront,
  saveStorefrontDraftData,
  slugifyStorefrontInput,
  storefrontPublicPath,
  unpublishStorefront,
  uniqueStorefrontSlug,
} from "@/lib/catalogue/storefront";
import {
  parseStorefrontConfig,
  buildDefaultStorefrontConfig,
} from "@/lib/storefront/config";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";
import { isStorefrontThemePreset } from "@/lib/storefront/themes";
import type { StorefrontConfig } from "@/lib/storefront/types";

function parseDraftConfig(raw: string | null): StorefrontConfig {
  if (!raw) {
    return buildDefaultStorefrontConfig({
      businessMode: "FOOD_BUSINESS",
      fulfilmentIntents: ["pickup"],
    });
  }
  try {
    return parseStorefrontConfig(JSON.parse(raw));
  } catch {
    return buildDefaultStorefrontConfig({
      businessMode: "FOOD_BUSINESS",
      fulfilmentIntents: ["pickup"],
    });
  }
}

export async function saveStorefrontDraft(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 120);
  const subheadline =
    String(formData.get("subheadline") ?? "").trim().slice(0, 240) || null;
  const about = String(formData.get("about") ?? "").trim().slice(0, 2000) || null;
  const slugInput = slugifyStorefrontInput(
    String(formData.get("slug") ?? "").trim(),
  );
  const themePresetRaw = String(formData.get("themePreset") ?? "market");
  const themePreset = isStorefrontThemePreset(themePresetRaw)
    ? themePresetRaw
    : "market";
  const contactEmail =
    String(formData.get("contactEmail") ?? "").trim().slice(0, 200) || null;
  const showPhone = formData.get("showPhone") === "on";
  const draftConfig = parseDraftConfig(
    String(formData.get("draftConfig") ?? ""),
  );
  const removeHero = formData.get("removeHero") === "on";

  if (!headline) redirect("/dashboard/website?error=headline");
  if (!slugInput) redirect("/dashboard/website?error=slug");

  let storefront = await ensureStorefront(owner.id, owner.businessName);
  let slug = storefront.slug;
  if (slugInput !== storefront.slug) {
    slug = await uniqueStorefrontSlug(slugInput, owner.id);
  }

  let heroImageUrl = storefront.heroImageUrl;
  if (removeHero) {
    heroImageUrl = null;
  }
  const heroFile = formData.get("heroImage");
  if (heroFile instanceof File && heroFile.size > 0) {
    heroImageUrl = await uploadStorefrontHero(owner.id, heroFile);
  }

  await saveStorefrontDraftData({
    ownerId: owner.id,
    headline,
    subheadline,
    about,
    slug,
    themePreset,
    contactEmail,
    showPhone,
    heroImageUrl,
    draftConfig,
  });

  revalidatePath("/dashboard/website");
  revalidatePath(storefrontPublicPath(slug));
  redirect("/dashboard/website?saved=1");
}

export async function publishStorefrontAction() {
  const { owner } = await requireOwnerWrite();
  await ensureStorefront(owner.id, owner.businessName);
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId: owner.id },
  });
  await publishStorefront(owner.id);
  revalidatePath("/dashboard/website");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect("/dashboard/website?published=1");
}

export async function unpublishStorefrontAction() {
  const { owner } = await requireOwnerWrite();
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId: owner.id },
  });
  await unpublishStorefront(owner.id);
  revalidatePath("/dashboard/website");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect("/dashboard/website?unpublished=1");
}

export async function saveStorefrontDomain(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const customDomain =
    String(formData.get("customDomain") ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200) || null;

  await ensureStorefront(owner.id, owner.businessName);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { customDomain },
  });

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?saved=1");
}

/** @deprecated */
export async function saveStorefront(formData: FormData) {
  return saveStorefrontDraft(formData);
}

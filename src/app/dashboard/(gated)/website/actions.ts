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
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";
import { isStorefrontThemePreset } from "@/lib/storefront/themes";

export async function saveStorefrontDetails(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 120);
  const subheadline =
    String(formData.get("subheadline") ?? "").trim().slice(0, 240) || null;
  const about = String(formData.get("about") ?? "").trim().slice(0, 2000) || null;
  const slugInput = slugifyStorefrontInput(
    String(formData.get("slug") ?? "").trim(),
  );
  const contactEmail =
    String(formData.get("contactEmail") ?? "").trim().slice(0, 200) || null;
  const showPhone = formData.get("showPhone") === "on";

  if (!headline) redirect("/dashboard/website/details?error=headline");
  if (!slugInput) redirect("/dashboard/website/details?error=slug");

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  let slug = storefront.slug;
  if (slugInput !== storefront.slug) {
    slug = await uniqueStorefrontSlug(slugInput, owner.id);
    if (slug !== slugInput) {
      redirect("/dashboard/website/details?error=slug_taken");
    }
  }

  const themePreset = isStorefrontThemePreset(storefront.themePreset)
    ? storefront.themePreset
    : "market";
  const draftConfig = parseStorefrontConfig(storefront.draftConfig);

  await saveStorefrontDraftData({
    ownerId: owner.id,
    headline,
    subheadline,
    about,
    slug,
    themePreset,
    contactEmail,
    showPhone,
    heroImageUrl: storefront.heroImageUrl,
    draftConfig,
    existingDraftConfigRaw: storefront.draftConfig,
  });

  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/branding");
  revalidatePath("/dashboard/website/studio");
  revalidatePath("/dashboard/website/ai");
  revalidatePath(storefrontPublicPath(slug));
  redirect("/dashboard/website/details?saved=1");
}

export async function saveStorefrontBranding(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const removeHero = formData.get("removeHero") === "on";
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  let heroImageUrl = storefront.heroImageUrl;
  if (removeHero) heroImageUrl = null;
  const heroFile = formData.get("heroImage");
  if (heroFile instanceof File && heroFile.size > 0) {
    try {
      heroImageUrl = await uploadStorefrontHero(owner.id, heroFile);
    } catch {
      redirect("/dashboard/website/branding?error=1");
    }
  }

  const themePreset = isStorefrontThemePreset(storefront.themePreset)
    ? storefront.themePreset
    : "market";
  const draftConfig = parseStorefrontConfig(storefront.draftConfig);

  await saveStorefrontDraftData({
    ownerId: owner.id,
    headline: storefront.headline ?? owner.businessName,
    subheadline: storefront.subheadline,
    about: storefront.about,
    slug: storefront.slug,
    themePreset,
    contactEmail: storefront.contactEmail,
    showPhone: storefront.showPhone,
    heroImageUrl,
    draftConfig,
    existingDraftConfigRaw: storefront.draftConfig,
  });

  revalidatePath("/dashboard/website/branding");
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath("/dashboard/website/ai");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/branding?saved=1");
}

export async function publishStorefrontAction() {
  const { owner } = await requireOwnerWrite();
  await ensureStorefront(owner.id, owner.businessName);
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId: owner.id },
  });
  await publishStorefront(owner.id);
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect("/dashboard/website/details?published=1");
}

export async function unpublishStorefrontAction() {
  const { owner } = await requireOwnerWrite();
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId: owner.id },
  });
  await unpublishStorefront(owner.id);
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect("/dashboard/website/details?unpublished=1");
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

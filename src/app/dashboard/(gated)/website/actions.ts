"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  saveStorefrontDraftData,
  slugifyStorefrontInput,
  storefrontPublicPath,
  unpublishStorefront,
  uniqueStorefrontSlug,
} from "@/lib/catalogue/storefront";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";
import {
  uploadStorefrontFavicon,
  uploadStorefrontLogo,
} from "@/lib/storefront/brand-asset-upload";
import { isStorefrontThemePreset } from "@/lib/storefront/themes";
import { parseAccentColor } from "@/lib/stand-brand";
import { webStudioPath } from "@/lib/website/web-studio-nav";
import { clearHeroDecorativeFromDraftRaw } from "@/lib/studio/storage";
import { getFontPair } from "@/lib/website/brand-looks";
import { overlayStorefrontIdentity } from "@/lib/storefront/identity";
import { tryPublishStorefront } from "@/lib/website/persistence/publish";

function removeFlag(formData: FormData, name: string): boolean {
  return formData.has(name);
}

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

  if (!headline) redirect(webStudioPath("details", { error: "headline" }));
  if (!slugInput) redirect(webStudioPath("details", { error: "slug" }));

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  let slug = storefront.slug;
  if (slugInput !== storefront.slug) {
    slug = await uniqueStorefrontSlug(slugInput, owner.id);
    if (slug !== slugInput) {
      redirect(webStudioPath("details", { error: "slug_taken" }));
    }
  }

  const themePreset = isStorefrontThemePreset(storefront.themePreset)
    ? storefront.themePreset
    : "market";
  const draftConfig = parseStorefrontConfig(storefront.draftConfig);

  const saved = await saveStorefrontDraftData({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    slug,
    themePreset,
    identity: { headline, subheadline, about, contactEmail, showPhone },
    draftConfig,
    existingDraftConfigRaw: storefront.draftConfig,
  });
  if (!saved.ok) redirect(webStudioPath("details", { error: "conflict" }));

  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/branding");
  revalidatePath("/dashboard/website/studio");
  revalidatePath("/dashboard/website/ai");
  revalidatePath(storefrontPublicPath(slug));
  redirect(webStudioPath("details", { saved: "1" }));
}

export async function saveStorefrontBranding(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const removeHero = removeFlag(formData, "removeHero");
  const removeLogo = removeFlag(formData, "removeLogo");
  const removeFavicon = removeFlag(formData, "removeFavicon");
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const stand = await prisma.stand.findFirst({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "asc" },
    select: { logoUrl: true, accentColor: true, secondaryColor: true },
  });
  const draftConfig = parseStorefrontConfig(storefront.draftConfig);
  const current = overlayStorefrontIdentity(storefront, draftConfig.identity);

  let heroImageUrl = current.heroImageUrl;
  if (removeHero) heroImageUrl = null;
  const heroFile = formData.get("heroImage");
  if (!removeHero && heroFile instanceof File && heroFile.size > 0) {
    try {
      heroImageUrl = await uploadStorefrontHero(owner.id, heroFile);
    } catch {
      redirect(webStudioPath("branding", { error: "1" }));
    }
  }

  let faviconUrl = current.faviconUrl ?? null;
  if (removeFavicon) faviconUrl = null;
  const faviconFile = formData.get("favicon");
  if (!removeFavicon && faviconFile instanceof File && faviconFile.size > 0) {
    try {
      faviconUrl = await uploadStorefrontFavicon(owner.id, faviconFile);
    } catch {
      redirect(webStudioPath("branding", { error: "1" }));
    }
  }

  let logoUrl =
    draftConfig.identity?.logoUrl !== undefined
      ? draftConfig.identity.logoUrl
      : (owner.brandLogoUrl ?? stand?.logoUrl ?? null);
  if (removeLogo) logoUrl = null;
  const logoFile = formData.get("logo");
  if (!removeLogo && logoFile instanceof File && logoFile.size > 0) {
    try {
      logoUrl = await uploadStorefrontLogo(owner.id, logoFile);
    } catch {
      redirect(webStudioPath("branding", { error: "1" }));
    }
  }

  const accentParsed = parseAccentColor(String(formData.get("accentColor") ?? ""));
  const secondaryParsed = parseAccentColor(String(formData.get("secondaryColor") ?? ""));
  const accentColor =
    accentParsed ??
    draftConfig.themeOverrides?.accentColor ??
    owner.brandAccentColor ??
    stand?.accentColor ??
    "#2e7d3f";
  const secondaryColor =
    secondaryParsed ??
    draftConfig.themeOverrides?.secondaryColor ??
    owner.brandSecondaryColor ??
    stand?.secondaryColor ??
    accentColor;

  const themePreset = isStorefrontThemePreset(storefront.themePreset)
    ? storefront.themePreset
    : "market";
  draftConfig.themeOverrides = {
    ...draftConfig.themeOverrides,
    accentColor,
    secondaryColor,
    fontPairId: (() => {
      const raw = String(formData.get("fontPairId") ?? "").trim();
      if (raw && getFontPair(raw)) return raw;
      return draftConfig.themeOverrides?.fontPairId || "market-default";
    })(),
  };

  let existingDraftConfigRaw: unknown = storefront.draftConfig;
  if (removeHero) {
    existingDraftConfigRaw = clearHeroDecorativeFromDraftRaw(storefront.draftConfig);
  }

  const saved = await saveStorefrontDraftData({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    slug: storefront.slug,
    themePreset,
    identity: { heroImageUrl, faviconUrl, logoUrl },
    draftConfig,
    existingDraftConfigRaw,
  });
  if (!saved.ok) redirect(webStudioPath("branding", { error: "conflict" }));

  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/branding");
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath("/dashboard/website/ai");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(webStudioPath("branding", { saved: "1" }));
}

export async function publishStorefrontAction() {
  const { owner, user } = await requireOwnerWrite();
  const sf = await ensureStorefront(owner.id, owner.businessName);
  const published = await tryPublishStorefront(owner.id, user.id);
  if (!published.ok) redirect(webStudioPath("details", { error: "publish_blocked" }));
  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect(webStudioPath("details", { published: "1" }));
}

export async function unpublishStorefrontAction() {
  const { owner } = await requireOwnerWrite();
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId: owner.id },
  });
  await unpublishStorefront(owner.id);
  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/details");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(sf.slug));
  redirect(webStudioPath("details", { unpublished: "1" }));
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

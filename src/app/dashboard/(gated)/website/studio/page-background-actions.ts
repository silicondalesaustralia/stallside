"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { isColourValue } from "@/lib/website/sections/section-style";
import { clampBrandNameSize, clampNavTextSize } from "@/lib/storefront/header-style";
import { siteStyleSchema, type SiteStyle } from "@/lib/storefront/site-style";

type ThemeColourKey = "pageBackground" | "buttonColour" | "buttonTextColour" | "linkColour";
type SaveResult = { ok: true; revision: number } | { ok: false; error: string };

/** Sets (or clears, with null) site-wide theme colours in the draft. */
async function saveThemeColours(
  patch: Partial<Record<ThemeColourKey, string | null>>,
  expectedRevision: number,
  logLabel: string,
): Promise<SaveResult> {
  if (Object.values(patch).some((v) => v !== null && v !== undefined && !isColourValue(v))) {
    return { ok: false, error: "Pick a theme colour or a #rrggbb colour." };
  }
  return writeThemeOverrides(patch, expectedRevision, logLabel);
}

/** Writes already-validated theme override values to the draft; null removes the key. */
async function writeThemeOverrides(
  patch: Record<string, string | number | SiteStyle | null | undefined>,
  expectedRevision: number,
  logLabel: string,
): Promise<SaveResult> {
  const { owner } = await requireWebsiteOwner();
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const raw =
      storefront.draftConfig && typeof storefront.draftConfig === "object" && !Array.isArray(storefront.draftConfig)
        ? (storefront.draftConfig as Record<string, unknown>)
        : {};
    const themeOverrides: Record<string, unknown> = {
      ...parseStorefrontConfig(storefront.draftConfig).themeOverrides,
    };
    for (const [key, value] of Object.entries(patch)) {
      if (value !== null && value !== undefined && value !== "") themeOverrides[key] = value;
      else delete themeOverrides[key];
    }
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision,
      draftConfig: { ...raw, themeOverrides } as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
    revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
    return { ok: true, revision: saved.revision };
  } catch (err) {
    console.error(`[${logLabel} save]`, err);
    return { ok: false, error: err instanceof Error ? err.message : `Could not save the ${logLabel}.` };
  }
}

/** Sets (or clears, with null) the colour behind sections on every page, in the draft. */
export async function saveStorefrontPageBackground(input: {
  pageBackground: string | null;
  expectedRevision: number;
}): Promise<SaveResult> {
  return saveThemeColours({ pageBackground: input.pageBackground }, input.expectedRevision, "page background");
}

/** Sets (or clears) the colour of every main button on the site, in the draft. */
export async function saveStorefrontButtonColours(input: {
  buttonColour: string | null;
  buttonTextColour: string | null;
  expectedRevision: number;
}): Promise<SaveResult> {
  return saveThemeColours(
    { buttonColour: input.buttonColour, buttonTextColour: input.buttonTextColour },
    input.expectedRevision,
    "button colours",
  );
}

/** Sets (or clears) the colour of text links in page content on every page, in the draft. */
export async function saveStorefrontLinkColour(input: {
  linkColour: string | null;
  expectedRevision: number;
}): Promise<SaveResult> {
  return saveThemeColours({ linkColour: input.linkColour }, input.expectedRevision, "link colour");
}

/** Sets (or clears, with null) the header menu link text size in px, in the draft. */
export async function saveStorefrontNavTextSize(input: {
  navTextSize: number | null;
  expectedRevision: number;
}): Promise<SaveResult> {
  const size = input.navTextSize === null ? null : clampNavTextSize(input.navTextSize);
  if (size === undefined) return { ok: false, error: "Pick a menu text size." };
  return writeThemeOverrides({ navTextSize: size }, input.expectedRevision, "menu text size");
}

/** Sets (or clears, with null) the header business name text size in px, in the draft. */
export async function saveStorefrontBrandNameSize(input: {
  brandNameSize: number | null;
  expectedRevision: number;
}): Promise<SaveResult> {
  const size = input.brandNameSize === null ? null : clampBrandNameSize(input.brandNameSize);
  if (size === undefined) return { ok: false, error: "Pick a name text size." };
  return writeThemeOverrides({ brandNameSize: size }, input.expectedRevision, "name text size");
}

/** Sets the site-wide fonts, colours, sizes, width and spacing in the draft; empty = template defaults. */
export async function saveStorefrontSiteStyle(input: {
  siteStyle: SiteStyle;
  expectedRevision: number;
}): Promise<SaveResult> {
  const parsed = siteStyleSchema.strict().safeParse(input.siteStyle);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the site-wide settings." };
  const siteStyle = Object.keys(parsed.data).length ? parsed.data : null;
  return writeThemeOverrides({ siteStyle }, input.expectedRevision, "site-wide style");
}

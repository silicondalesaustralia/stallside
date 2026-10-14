"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { isColourValue } from "@/lib/website/sections/section-style";

type ThemeColourKey = "pageBackground" | "buttonColour" | "buttonTextColour";
type SaveResult = { ok: true; revision: number } | { ok: false; error: string };

/** Sets (or clears, with null) site-wide theme colours in the draft. */
async function saveThemeColours(
  patch: Partial<Record<ThemeColourKey, string | null>>,
  expectedRevision: number,
  logLabel: string,
): Promise<SaveResult> {
  const { owner } = await requireWebsiteOwner();
  if (Object.values(patch).some((v) => v !== null && v !== undefined && !isColourValue(v))) {
    return { ok: false, error: "Pick a theme colour or a #rrggbb colour." };
  }
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
      if (value) themeOverrides[key] = value;
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

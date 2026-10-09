"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { isColourValue } from "@/lib/website/sections/section-style";

/** Sets (or clears, with null) the colour behind sections on every page, in the draft. */
export async function saveStorefrontPageBackground(input: {
  pageBackground: string | null;
  expectedRevision: number;
}): Promise<{ ok: true; revision: number } | { ok: false; error: string }> {
  const { owner } = await requireWebsiteOwner();
  if (input.pageBackground !== null && !isColourValue(input.pageBackground)) {
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
    if (input.pageBackground) themeOverrides.pageBackground = input.pageBackground;
    else delete themeOverrides.pageBackground;
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: input.expectedRevision,
      draftConfig: { ...raw, themeOverrides } as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
    revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
    return { ok: true, revision: saved.revision };
  } catch (err) {
    console.error("[page background save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not save the page background." };
  }
}

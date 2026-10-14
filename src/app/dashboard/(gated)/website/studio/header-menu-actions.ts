"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { headerMenuProblem, headerMenuSchema, type HeaderMenu } from "@/lib/studio/header-menu";

/** Saves the seller's header menu to the draft, or clears it (null) to go back to automatic. */
export async function saveStorefrontHeaderMenu(input: {
  menu: unknown;
  expectedRevision: number;
}): Promise<{ ok: true; revision: number } | { ok: false; error: string }> {
  const { owner } = await requireWebsiteOwner();
  let menu: HeaderMenu | null = null;
  if (input.menu !== null) {
    const parsed = headerMenuSchema.safeParse(input.menu);
    if (!parsed.success) return { ok: false, error: "Every link needs text and a page, product or web address." };
    const problem = headerMenuProblem(parsed.data);
    if (problem) return { ok: false, error: problem };
    menu = parsed.data;
  }
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const raw: Record<string, unknown> =
      storefront.draftConfig && typeof storefront.draftConfig === "object" && !Array.isArray(storefront.draftConfig)
        ? { ...(storefront.draftConfig as Record<string, unknown>) }
        : {};
    if (menu) raw.headerMenu = menu;
    else delete raw.headerMenu;
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: input.expectedRevision,
      draftConfig: raw as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
    revalidatePath("/dashboard/website/navigation");
    revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
    return { ok: true, revision: saved.revision };
  } catch (err) {
    console.error("[header menu save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not save the header menu." };
  }
}

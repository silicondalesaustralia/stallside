"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, parseExpectedRevision, writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { uploadStorefrontFavicon } from "@/lib/storefront/brand-asset-upload";

export type FaviconSaveResult =
  | { ok: true; revision: number; faviconUrl: string | null }
  | { ok: false; error: string };

/** Uploads (`favicon` file) or clears (`remove=1`) the site favicon in the draft. */
export async function saveStorefrontFavicon(formData: FormData): Promise<FaviconSaveResult> {
  const { owner } = await requireWebsiteOwner();
  try {
    const expectedRevision = parseExpectedRevision(formData.get("expectedRevision"));
    if (expectedRevision === null) return { ok: false, error: "Reload the editor and try again." };
    const file = formData.get("favicon");
    let faviconUrl: string | null = null;
    if (formData.get("remove") !== "1") {
      if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a favicon file." };
      faviconUrl = await uploadStorefrontFavicon(owner.id, file);
    }

    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const raw =
      storefront.draftConfig && typeof storefront.draftConfig === "object" && !Array.isArray(storefront.draftConfig)
        ? (storefront.draftConfig as Record<string, unknown>)
        : {};
    const identity =
      raw.identity && typeof raw.identity === "object" && !Array.isArray(raw.identity)
        ? (raw.identity as Record<string, unknown>)
        : {};
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision,
      draftConfig: { ...raw, identity: { ...identity, faviconUrl } } as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
    revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
    revalidatePath("/dashboard/website/branding");
    return { ok: true, revision: saved.revision, faviconUrl };
  } catch (err) {
    console.error("[favicon save]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not save the favicon." };
  }
}

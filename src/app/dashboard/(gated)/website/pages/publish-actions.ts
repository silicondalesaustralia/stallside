"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
import {
  ensureCustomPages,
  findCustomPageById,
  mergeCustomPagesIntoRaw,
} from "@/lib/studio/custom-pages";

/**
 * Publishes or unpublishes one page. The draft is updated, and if the page is
 * already on the live site the change applies there straight away.
 * `back: "list"` returns to the Pages list instead of the page's settings.
 */
export async function setCustomPageEnabled(pageId: string, enabled: boolean, back: "page" | "list" = "page") {
  const { owner } = await requireWebsiteOwner();
  const path = `/dashboard/website/pages/${pageId}`;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  if (!findCustomPageById(pages, pageId)) redirect("/dashboard/website/pages?error=missing");

  const next = pages.map((p) => (p.id === pageId ? { ...p, enabled } : p));
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: mergeCustomPagesIntoRaw(storefront.draftConfig, next) as Prisma.InputJsonValue,
    conflictPath: path,
  });

  await patchLiveConfig(owner.id, (live) => {
    const livePages = ensureCustomPages(live);
    if (!livePages.some((p) => p.id === pageId)) return live as Prisma.InputJsonValue;
    const patched = livePages.map((p) => (p.id === pageId ? { ...p, enabled } : p));
    return mergeCustomPagesIntoRaw(live, patched) as Prisma.InputJsonValue;
  });

  revalidatePath("/dashboard/website/pages");
  revalidatePath(path);
  revalidatePath(storefrontPublicPath(storefront.slug));
  const done = `${enabled ? "published" : "unpublished"}=1`;
  redirect(back === "list" ? `/dashboard/website/pages?${done}` : `${path}?${done}`);
}

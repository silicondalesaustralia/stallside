"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";
import { ensureCustomPages, mergeCustomPagesIntoRaw } from "@/lib/studio/custom-pages";
import { ensureBlogSettings, mergeBlogSettingsIntoRaw } from "@/lib/studio/blog";
import {
  applyNavigationLayout,
  type NavigationLayoutPayload,
} from "@/lib/studio/navigation";
import { syncBuiltinCustomPages } from "../pages/actions";

function parsePayload(raw: string): NavigationLayoutPayload {
  try {
    const parsed = JSON.parse(raw) as NavigationLayoutPayload;
    if (!parsed || typeof parsed !== "object") throw new Error("invalid");
    if (!Array.isArray(parsed.headerOrder) || !Array.isArray(parsed.footerOrder)) {
      throw new Error("invalid");
    }
    return {
      ...parsed,
      footerColumns: parsed.footerColumns ?? {},
    };
  } catch {
    redirect("/dashboard/website/navigation?error=invalid");
  }
}

export async function saveNavigationLayout(layoutJson: string) {
  const { owner } = await requireWebsiteOwner();
  await syncBuiltinCustomPages();
  const payload = parsePayload(layoutJson);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const blogSettings = ensureBlogSettings(storefront.draftConfig);
  const { pages: nextPages, blogSettings: nextBlog } = applyNavigationLayout(
    pages,
    blogSettings,
    payload,
  );

  let merged = mergeCustomPagesIntoRaw(storefront.draftConfig, nextPages);
  merged = mergeBlogSettingsIntoRaw(merged, nextBlog);

  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: "/dashboard/website/navigation",
  });

  revalidatePath("/dashboard/website/navigation");
  revalidatePath("/dashboard/website/pages");
  revalidatePath("/dashboard/website/blog");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/navigation?saved=1");
}

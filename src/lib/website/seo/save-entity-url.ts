"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { slugifyPageSlug } from "@/lib/studio/custom-pages";
import { isWellFormedSiteSlug } from "@/lib/storefront/site-slugs";
import { changeDbEntitySlug } from "./change-db-entity-slug";
import { changeConfigEntitySlug } from "./change-config-entity-slug";
import { URL_ERROR_PREFIX, type SlugChangeResult } from "./entity-context-types";

function backTo(returnTo: string, status: string): string {
  const path = returnTo.startsWith("/dashboard/") && !returnTo.startsWith("//") ? returnTo : "/dashboard";
  return `${path}${path.includes("?") ? "&" : "?"}seo=${encodeURIComponent(status)}#seo`;
}

/** Changes an item's address from its search & social settings, optionally redirecting the old one. */
export async function saveEntityUrl(entityKey: string, returnTo: string, formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const slug = slugifyPageSlug(String(formData.get("slug") ?? ""));
  const redirectOld = formData.get("redirectOld") === "on";

  let result: SlugChangeResult;
  if (!isWellFormedSiteSlug(slug)) {
    result = { ok: false, message: "Use lowercase letters, numbers and dashes only." };
  } else {
    try {
      result =
        (await changeDbEntitySlug(owner.id, entityKey, slug, redirectOld)) ??
        (await changeConfigEntitySlug(owner.id, owner.businessName, entityKey, slug, redirectOld)) ??
        { ok: false, message: "This address can't be changed." };
    } catch (e) {
      console.error("saveEntityUrl failed", entityKey, e);
      result = { ok: false, message: "Couldn't change the address. Please try again." };
    }
  }

  if (!result.ok) redirect(backTo(returnTo, `${URL_ERROR_PREFIX}${result.message}`));
  revalidatePath(returnTo.split("?")[0]);
  redirect(backTo(returnTo, "url-saved"));
}

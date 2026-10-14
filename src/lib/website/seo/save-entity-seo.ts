"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import {
  extractStorefrontSeo,
  mergeStorefrontSeoIntoRaw,
  readEntitySeo,
  sanitizeSeoSettings,
  writeEntitySeo,
  type SeoRobotsMode,
} from "@/lib/studio/seo-settings";

export type SeoFieldsVariant = "all" | "social";

function parseRobots(raw: string): SeoRobotsMode {
  if (raw === "index" || raw === "noindex") return raw;
  return "default";
}

function safeReturnPath(raw: string): string {
  return raw.startsWith("/dashboard/") && !raw.startsWith("//") ? raw : "/dashboard";
}

function withSeoStatus(path: string, status: "saved" | "conflict"): string {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}seo=${status}#seo`;
}

/**
 * Saves the website's search and social overrides for one entity to the draft.
 * The "social" variant leaves search title and description to the entity's own fields.
 */
export async function saveEntitySeo(
  entityKey: string,
  returnTo: string,
  variant: SeoFieldsVariant,
  formData: FormData,
) {
  const { owner } = await requireWebsiteOwner();
  const back = safeReturnPath(returnTo);
  const field = (name: string) => String(formData.get(name) ?? "");
  const settings = sanitizeSeoSettings({
    seoTitle: variant === "all" ? field("seoTitle") : "",
    seoDescription: variant === "all" ? field("seoDescription") : "",
    ogTitle: field("ogTitle"),
    ogDescription: field("ogDescription"),
    ogImageUrl: field("ogImageUrl"),
    robots: parseRobots(field("robots")),
  });

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const config = extractStorefrontSeo(storefront.draftConfig);
  const unchanged =
    JSON.stringify(sanitizeSeoSettings(readEntitySeo(config, entityKey) ?? {})) ===
    JSON.stringify(settings);
  if (!unchanged) {
    const merged = mergeStorefrontSeoIntoRaw(
      storefront.draftConfig,
      writeEntitySeo(config, entityKey, settings),
    );
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: storefront.draftRevision,
      draftConfig: merged as Prisma.InputJsonValue,
    });
    if (!saved.ok) redirect(withSeoStatus(back, "conflict"));
  }

  revalidatePath(back.split("?")[0]);
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(withSeoStatus(back, "saved"));
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import type { Prisma } from "@/generated/prisma/client";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";
import {
  entityKeyFromParam,
  extractStorefrontSeo,
  mergeStorefrontSeoIntoRaw,
  sanitizeSeoSettings,
  writeEntitySeo,
  type EntitySeoSettings,
  type SeoRobotsMode,
} from "@/lib/studio/seo-settings";

function parseRobots(raw: string): SeoRobotsMode {
  if (raw === "index" || raw === "noindex") return raw;
  return "default";
}

function parseSettings(formData: FormData): EntitySeoSettings {
  return sanitizeSeoSettings({
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    ogTitle: String(formData.get("ogTitle") ?? ""),
    ogDescription: String(formData.get("ogDescription") ?? ""),
    ogImageUrl: String(formData.get("ogImageUrl") ?? ""),
    robots: parseRobots(String(formData.get("robots") ?? "default")),
  });
}

export async function saveEntitySeo(entityParam: string, formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const entityKey = entityKeyFromParam(entityParam);
  const settings = parseSettings(formData);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const config = extractStorefrontSeo(storefront.draftConfig);
  const merged = mergeStorefrontSeoIntoRaw(
    storefront.draftConfig,
    writeEntitySeo(config, entityKey, settings),
  );

  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: `/dashboard/website/seo/${entityParam}`,
  });

  revalidatePath("/dashboard/website/seo");
  revalidatePath(`/dashboard/website/seo/${entityParam}`);
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(`/dashboard/website/seo/${entityParam}?saved=1`);
}

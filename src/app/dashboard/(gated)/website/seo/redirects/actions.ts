"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
import {
  ensureStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import {
  extractStorefrontRedirects,
  mergeStorefrontRedirectsIntoRaw,
  sanitizeRedirectInput,
} from "@/lib/studio/redirects";
import type { Prisma } from "@/generated/prisma/client";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";

const REDIRECTS_PATH = "/dashboard/website/seo/redirects";

export async function addStorefrontRedirect(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractStorefrontRedirects(storefront.draftConfig);
  const next = sanitizeRedirectInput({
    fromPath: String(formData.get("fromPath") ?? ""),
    toPath: String(formData.get("toPath") ?? ""),
    code: String(formData.get("code") ?? "301"),
    enabled: true,
  });
  if (!next) redirect("/dashboard/website/seo/redirects?error=invalid");
  if (existing.some((r) => r.fromPath === next.fromPath)) {
    redirect("/dashboard/website/seo/redirects?error=duplicate");
  }

  const merged = mergeStorefrontRedirectsIntoRaw(storefront.draftConfig, [
    ...existing,
    next,
  ]);
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: REDIRECTS_PATH,
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?saved=1");
}

export async function deleteStorefrontRedirect(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const id = String(formData.get("id") ?? "");
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractStorefrontRedirects(storefront.draftConfig);
  const next = existing.filter((r) => r.id !== id);
  const merged = mergeStorefrontRedirectsIntoRaw(storefront.draftConfig, next);
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: REDIRECTS_PATH,
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?deleted=1");
}

export async function toggleStorefrontRedirect(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const id = String(formData.get("id") ?? "");
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractStorefrontRedirects(storefront.draftConfig);
  const next = existing.map((r) =>
    r.id === id ? { ...r, enabled: !r.enabled } : r,
  );
  const merged = mergeStorefrontRedirectsIntoRaw(storefront.draftConfig, next);
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: REDIRECTS_PATH,
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?saved=1");
}

/** Makes only the redirect list live; other draft changes wait for "Publish website". */
export async function publishStorefrontRedirects() {
  const { owner } = await requireWebsiteOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const redirects = extractStorefrontRedirects(storefront.draftConfig);
  const applied = await patchLiveConfig(
    owner.id,
    (publishedConfig) =>
      mergeStorefrontRedirectsIntoRaw(publishedConfig, redirects) as Prisma.InputJsonValue,
  );
  if (!applied) redirect(`${REDIRECTS_PATH}?error=not_published`);

  revalidatePath(REDIRECTS_PATH);
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(`${REDIRECTS_PATH}?published=1`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import {
  extractStorefrontRedirects,
  mergeStorefrontRedirectsIntoRaw,
  sanitizeRedirectInput,
} from "@/lib/studio/redirects";

export async function addStorefrontRedirect(formData: FormData) {
  const { owner } = await requireOwnerWrite();
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
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: {
      draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?saved=1");
}

export async function deleteStorefrontRedirect(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractStorefrontRedirects(storefront.draftConfig);
  const next = existing.filter((r) => r.id !== id);
  const merged = mergeStorefrontRedirectsIntoRaw(storefront.draftConfig, next);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: {
      draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?deleted=1");
}

export async function toggleStorefrontRedirect(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractStorefrontRedirects(storefront.draftConfig);
  const next = existing.map((r) =>
    r.id === id ? { ...r, enabled: !r.enabled } : r,
  );
  const merged = mergeStorefrontRedirectsIntoRaw(storefront.draftConfig, next);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: {
      draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?saved=1");
}

export async function publishStorefrontRedirects() {
  const { owner } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const redirects = extractStorefrontRedirects(storefront.draftConfig);
  const publishedBase =
    storefront.publishedConfig &&
    typeof storefront.publishedConfig === "object" &&
    !Array.isArray(storefront.publishedConfig)
      ? { ...(storefront.publishedConfig as Record<string, unknown>) }
      : storefront.draftConfig &&
          typeof storefront.draftConfig === "object" &&
          !Array.isArray(storefront.draftConfig)
        ? { ...(storefront.draftConfig as Record<string, unknown>) }
        : {};
  const published = mergeStorefrontRedirectsIntoRaw(publishedBase, redirects);

  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: {
      publishedConfig: published as import("@/generated/prisma/client").Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/website/seo/redirects");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/seo/redirects?published=1");
}

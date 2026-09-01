"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  slugifyStorefrontInput,
  storefrontFullUrl,
  storefrontPublicPath,
  uniqueStorefrontSlug,
} from "@/lib/catalogue/storefront";

export async function saveStorefront(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 120);
  const about = String(formData.get("about") ?? "").trim().slice(0, 2000) || null;
  const slugInput = slugifyStorefrontInput(
    String(formData.get("slug") ?? "").trim(),
  );
  const isPublished = formData.get("isPublished") === "on";

  if (!headline) redirect("/dashboard/website?error=headline");
  if (!slugInput) redirect("/dashboard/website?error=slug");

  let storefront = await ensureStorefront(owner.id, owner.businessName);
  let slug = storefront.slug;
  if (slugInput !== storefront.slug) {
    slug = await uniqueStorefrontSlug(slugInput, owner.id);
  }

  storefront = await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { slug, headline, about, isPublished },
  });

  revalidatePath("/dashboard/website");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website?saved=1");
}

export async function saveStorefrontDomain(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const customDomain =
    String(formData.get("customDomain") ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200) || null;

  await ensureStorefront(owner.id, owner.businessName);
  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { customDomain },
  });

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?saved=1");
}

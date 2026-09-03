"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { ProductChannelType } from "@/generated/prisma/client";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";
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
  const { owner } = await requireOwnerWrite();
  const entityKey = entityKeyFromParam(entityParam);
  const settings = parseSettings(formData);
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  if (entityKey.startsWith("product:")) {
    const productId = entityKey.slice("product:".length);
    await prisma.product.updateMany({
      where: { id: productId, ownerId: owner.id },
      data: {
        seoTitle: settings.seoTitle ?? null,
        seoDescription: settings.seoDescription ?? null,
      },
    });
  }

  const config = extractStorefrontSeo(storefront.draftConfig);
  const merged = mergeStorefrontSeoIntoRaw(
    storefront.draftConfig,
    writeEntitySeo(config, entityKey, settings),
  );

  await prisma.storefront.update({
    where: { ownerId: owner.id },
    data: { draftConfig: merged as import("@/generated/prisma/client").Prisma.InputJsonValue },
  });

  revalidatePath("/dashboard/website/seo");
  revalidatePath(`/dashboard/website/seo/${entityParam}`);
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(`/dashboard/website/seo/${entityParam}?saved=1`);
}

export async function loadSeoCatalog(ownerId: string, businessName: string) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const standId = await primaryStandIdForOwner(ownerId);
  const seo = extractStorefrontSeo(storefront.draftConfig);

  const [pages, blogPosts, products, categories, menus] = await Promise.all([
    Promise.resolve(
      (await import("@/lib/studio/custom-pages")).ensureCustomPages(storefront.draftConfig),
    ),
    Promise.resolve(
      (await import("@/lib/studio/blog")).extractBlogPosts(storefront.draftConfig),
    ),
    standId
      ? prisma.product.findMany({
          where: {
            ownerId,
            isArchived: false,
            channels: {
              some: {
                standId,
                channelType: ProductChannelType.ONLINE,
                isEnabled: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, seoTitle: true, seoDescription: true },
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      where: { ownerId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    standId
      ? prisma.menu.findMany({
          where: { standId, isActive: true, showOnShop: true },
          orderBy: { title: "asc" },
          select: { id: true, title: true, slug: true, description: true },
        })
      : Promise.resolve([]),
  ]);

  return { storefront, seo, pages, blogPosts, products, categories, menus };
}

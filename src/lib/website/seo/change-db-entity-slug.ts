import { prisma } from "@/lib/prisma";
import { isReservedProductSlug } from "@/lib/slug";
import { siteSlugProblem } from "@/lib/storefront/site-slugs";
import { siteSlugOwnersFromConfig } from "@/lib/storefront/resolve-site-slug";
import { revalidateOwnerStores } from "@/lib/categories/category-admin";
import {
  addSiteRenameRedirect,
  clearSiteRedirectFrom,
  retargetSiteLinks,
} from "@/lib/website/persistence/site-redirect-patch";
import type { SlugLinkKind } from "@/lib/studio/retarget-links";
import type { SlugChangeResult } from "./entity-context-types";

const GONE: SlugChangeResult = { ok: false, message: "This item no longer exists." };

function taken(path: string, label: string): SlugChangeResult {
  return { ok: false, message: `"${path}" is already used by "${label}". Choose another.` };
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}

/** Points menu, footer and button links at the item's current slug (draft and live). */
async function relink(ownerId: string, kind: SlugLinkKind, prefix: string, slug: string, oldSlugs: string[] = []) {
  await retargetSiteLinks(ownerId, kind, prefix, slug, oldSlugs);
  await revalidateOwnerStores(ownerId);
  return { ok: true } as const;
}

/** Writes the new slug, then points the old address and links at it (or frees the new address of redirects). */
async function commit(
  ownerId: string,
  prefix: string,
  from: string,
  to: string,
  redirectOld: boolean,
  update: () => Promise<unknown>,
  linkKind?: SlugLinkKind,
): Promise<SlugChangeResult> {
  try {
    await update();
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, message: `"${prefix}${to}" was just taken. Choose another.` };
    throw e;
  }
  if (redirectOld) await addSiteRenameRedirect(ownerId, `${prefix}${from}`, `${prefix}${to}`);
  else await clearSiteRedirectFrom(ownerId, `${prefix}${to}`);
  if (linkKind) return relink(ownerId, linkKind, prefix, to, [from]);
  await revalidateOwnerStores(ownerId);
  return { ok: true };
}

async function changeCategorySlug(ownerId: string, id: string, slug: string, redirectOld: boolean) {
  const cat = await prisma.category.findFirst({ where: { id, ownerId }, select: { slug: true } });
  if (!cat) return GONE;
  if (cat.slug === slug) return relink(ownerId, "category", "/", slug);
  const storefront = await prisma.storefront.findFirst({ where: { ownerId }, select: { draftConfig: true } });
  const owners = await siteSlugOwnersFromConfig(ownerId, storefront?.draftConfig ?? null);
  const problem = siteSlugProblem(slug, owners, { kind: "category", id });
  if (problem) return { ok: false, message: problem } as const;
  const clash = await prisma.category.findFirst({ where: { ownerId, slug, NOT: { id } }, select: { title: true } });
  if (clash) return taken(`/${slug}`, clash.title);
  return commit(
    ownerId, "/", cat.slug, slug, redirectOld,
    () => prisma.category.update({ where: { id }, data: { slug } }),
    "category",
  );
}

async function changeProductSlug(ownerId: string, id: string, slug: string, redirectOld: boolean) {
  const product = await prisma.product.findFirst({ where: { id, ownerId }, select: { slug: true, standId: true } });
  if (!product) return GONE;
  if (product.slug === slug) return relink(ownerId, "product", "/products/", slug);
  if (isReservedProductSlug(slug)) return { ok: false, message: `"${slug}" is reserved. Choose another.` } as const;
  const clash = await prisma.product.findFirst({
    where: { standId: product.standId, slug, NOT: { id } },
    select: { name: true },
  });
  if (clash) return taken(`/products/${slug}`, clash.name);
  return commit(
    ownerId, "/products/", product.slug, slug, redirectOld,
    () => prisma.product.update({ where: { id }, data: { slug } }),
    "product",
  );
}

async function changeOfferSlug(ownerId: string, id: string, slug: string, redirectOld: boolean) {
  const offer = await prisma.subscriptionOffer.findFirst({ where: { id, ownerId }, select: { slug: true, standId: true } });
  if (!offer) return GONE;
  if (offer.slug === slug) return { ok: true } as const;
  const clash = await prisma.subscriptionOffer.findFirst({
    where: { standId: offer.standId, slug, NOT: { id } },
    select: { title: true },
  });
  if (clash) return taken(`/subscriptions/${slug}`, clash.title);
  return commit(ownerId, "/subscriptions/", offer.slug, slug, redirectOld, () =>
    prisma.subscriptionOffer.update({ where: { id }, data: { slug } }),
  );
}

async function changeMenuSlug(ownerId: string, id: string, slug: string, redirectOld: boolean) {
  const page = await prisma.preOrderPage.findFirst({ where: { id, ownerId }, select: { slug: true, standId: true } });
  if (page) {
    if (page.slug === slug) return { ok: true } as const;
    const clash = await prisma.preOrderPage.findFirst({
      where: { standId: page.standId, slug, NOT: { id } },
      select: { title: true },
    });
    if (clash) return taken(`/pre-orders/${slug}`, clash.title);
    return commit(ownerId, "/pre-orders/", page.slug, slug, redirectOld, () =>
      prisma.preOrderPage.update({ where: { id }, data: { slug } }),
    );
  }
  const menu = await prisma.menu.findFirst({ where: { id, ownerId }, select: { slug: true, standId: true, kind: true } });
  if (!menu) return GONE;
  if (menu.slug === slug) return { ok: true } as const;
  const prefix = `/${menu.kind === "PREORDER_DROP" ? "pre-orders" : "menus"}/`;
  const clash = await prisma.menu.findFirst({ where: { standId: menu.standId, slug, NOT: { id } }, select: { title: true } });
  if (clash) return taken(`${prefix}${slug}`, clash.title);
  return commit(ownerId, prefix, menu.slug, slug, redirectOld, () =>
    prisma.menu.update({ where: { id }, data: { slug } }),
  );
}

/** Changes the slug of a product, category, offer or menu, or null when the key isn't one of those. */
export async function changeDbEntitySlug(
  ownerId: string,
  entityKey: string,
  slug: string,
  redirectOld: boolean,
): Promise<SlugChangeResult | null> {
  const split = entityKey.indexOf(":");
  const [type, id] = [entityKey.slice(0, split), entityKey.slice(split + 1)];
  if (type === "category") return changeCategorySlug(ownerId, id, slug, redirectOld);
  if (type === "product") return changeProductSlug(ownerId, id, slug, redirectOld);
  if (type === "subscription") return changeOfferSlug(ownerId, id, slug, redirectOld);
  if (type === "menu") return changeMenuSlug(ownerId, id, slug, redirectOld);
  return null;
}

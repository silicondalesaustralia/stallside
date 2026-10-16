import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { qrTargetPath } from "./target-path";
import type { QrTargetOption } from "./target-types";

const PRODUCT_LIMIT = 2000;

/** Every website page a QR code can open, grouped for the picker. Uses the draft so new pages show up. */
export async function listQrTargets(ownerId: string): Promise<QrTargetOption[]> {
  const [storefront, categories, products, menus, preOrderPages] = await Promise.all([
    prisma.storefront.findUnique({ where: { ownerId }, select: { draftConfig: true } }),
    prisma.category.findMany({ where: { ownerId, isActive: true }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true, title: true, slug: true } }),
    prisma.product.findMany({
      where: { AND: [{ ownerId, isActive: true }, businessPageProductWhere] },
      orderBy: { name: "asc" },
      take: PRODUCT_LIMIT,
      select: { id: true, name: true, slug: true },
    }),
    prisma.menu.findMany({ where: { ownerId, isActive: true }, orderBy: { title: "asc" }, select: { id: true, title: true, slug: true, kind: true } }),
    prisma.preOrderPage.findMany({ where: { ownerId, isActive: true }, orderBy: { title: "asc" }, select: { id: true, title: true, slug: true } }),
  ]);

  const pages = ensureCustomPages(storefront?.draftConfig ?? {})
    .filter((p) => p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return [
    { kind: "home", id: null, label: "Home", group: "Website pages", path: qrTargetPath({ kind: "home" }) },
    ...pages.map((page): QrTargetOption => ({ kind: "page", id: page.id, label: page.title, group: "Website pages", path: qrTargetPath({ kind: "page", page }) })),
    { kind: "shop", id: null, label: "Shop (all products)", group: "Shop", path: qrTargetPath({ kind: "shop" }) },
    ...categories.map((c): QrTargetOption => ({ kind: "category", id: c.id, label: c.title, group: "Shop", path: qrTargetPath({ kind: "category", slug: c.slug }) })),
    { kind: "cart", id: null, label: "Cart", group: "Shop", path: qrTargetPath({ kind: "cart" }) },
    ...products.map((p): QrTargetOption => ({ kind: "product", id: p.id, label: p.name, group: "Products", path: qrTargetPath({ kind: "product", slug: p.slug }) })),
    ...menus.map((m): QrTargetOption => {
      const drop = m.kind === MenuKind.PREORDER_DROP;
      return { kind: "menu", id: m.id, label: drop ? `${m.title} (pre-order drop)` : m.title, group: "Menus & pre-orders", path: qrTargetPath({ kind: "menu", slug: m.slug, drop }) };
    }),
    ...preOrderPages.map((p): QrTargetOption => ({ kind: "preorder_page", id: p.id, label: p.title, group: "Menus & pre-orders", path: qrTargetPath({ kind: "preorder_page", slug: p.slug }) })),
  ];
}

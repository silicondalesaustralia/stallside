import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { qrTargetPath } from "./target-path";
import type { QrTarget } from "./target-types";

/**
 * Current path for a QR target on the live website, or null when the page, category, product,
 * menu or pre-order page no longer exists or is switched off. Callers fall back to the home page.
 */
export async function lookupQrTargetPath(ownerId: string, target: QrTarget, publishedConfig: unknown): Promise<string | null> {
  const id = target.id ?? "";
  switch (target.kind) {
    case "home":
    case "shop":
    case "cart":
      return qrTargetPath({ kind: target.kind });
    case "page": {
      const page = ensureCustomPages(publishedConfig ?? {}).find((p) => p.id === id && p.enabled);
      return page ? qrTargetPath({ kind: "page", page }) : null;
    }
    case "category": {
      const row = await prisma.category.findFirst({ where: { id, ownerId, isActive: true }, select: { slug: true } });
      return row ? qrTargetPath({ kind: "category", slug: row.slug }) : null;
    }
    case "product": {
      const row = await prisma.product.findFirst({
        where: { AND: [{ id, ownerId, isActive: true }, businessPageProductWhere] },
        select: { slug: true },
      });
      return row ? qrTargetPath({ kind: "product", slug: row.slug }) : null;
    }
    case "menu": {
      const row = await prisma.menu.findFirst({ where: { id, ownerId, isActive: true }, select: { slug: true, kind: true } });
      return row ? qrTargetPath({ kind: "menu", slug: row.slug, drop: row.kind === MenuKind.PREORDER_DROP }) : null;
    }
    case "preorder_page": {
      const row = await prisma.preOrderPage.findFirst({ where: { id, ownerId, isActive: true }, select: { slug: true } });
      return row ? qrTargetPath({ kind: "preorder_page", slug: row.slug }) : null;
    }
  }
}

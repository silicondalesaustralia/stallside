import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { STOREFRONT_PAGE_IDS, type StorefrontPageId } from "@/lib/storefront/types";

export async function loadStorefrontPage(
  slug: string,
  draft: boolean,
) {
  let ownerId: string | undefined;
  if (draft) {
    const session = await getAuthSession();
    if (!session?.user?.id) notFound();
    const owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!owner) notFound();
    ownerId = owner.id;
  }

  const ctx = await loadStorefrontContext(slug, { draft, ownerId });
  if (!ctx) notFound();
  return ctx;
}

export function storefrontEnabledPages(
  config: { pages: Record<StorefrontPageId, { enabled: boolean }> },
): StorefrontPageId[] {
  return STOREFRONT_PAGE_IDS.filter((id) => config.pages[id]?.enabled !== false);
}

export function filterProductsByCategory<T extends { id: string }>(
  products: T[],
  categorySlug: string | undefined,
  productCategories: Map<string, string[]>,
): T[] {
  if (!categorySlug) return products;
  return products.filter((p) =>
    productCategories.get(p.id)?.includes(categorySlug),
  );
}

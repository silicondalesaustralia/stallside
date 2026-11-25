import { prisma } from "@/lib/prisma";
import { pickMainCategory, productRelativePath } from "@/lib/catalogue/main-category";
import { productLiveWhere } from "@/lib/product-visibility";
import { mapLegacyStandRest } from "./legacy-stand-rest";

export { mapLegacyStandRest };

/**
 * Maps a legacy `/s/{stand}/…` path onto the storefront path (no host).
 * Returns null when this stand path should stay on the farmstand (e.g. /pay).
 */
export async function storefrontPathFromLegacyStand(
  standSlug: string,
  pathname: string,
): Promise<string | null> {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "s" || !parts[1]) return null;
  const mapped = mapLegacyStandRest(parts.slice(2));
  if (mapped == null || typeof mapped === "string") return mapped;
  const categorySlug = await mainCategorySlugForProduct(standSlug, mapped.product);
  return productRelativePath(mapped.product, categorySlug);
}

async function mainCategorySlugForProduct(
  standSlug: string,
  productSlug: string,
): Promise<string | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug.trim().toLowerCase(),
        stand: { slug: standSlug.trim().toLowerCase() },
        ...productLiveWhere,
      },
      select: {
        primaryCategoryId: true,
        categoryLinks: { select: { categoryId: true } },
        ownerId: true,
      },
    });
    if (!product) return null;
    const categories = await prisma.category.findMany({
      where: { ownerId: product.ownerId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, showOnWebsite: true },
    });
    const linked = new Set(product.categoryLinks.map((l) => l.categoryId));
    return pickMainCategory(product.primaryCategoryId, linked, categories)?.slug ?? null;
  } catch (err) {
    console.error("[legacy-stand-path] category lookup failed", standSlug, productSlug, err);
    return null;
  }
}

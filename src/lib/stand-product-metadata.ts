import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pickMainCategory } from "@/lib/catalogue/main-category";
import { isReservedProductSlug } from "@/lib/slug";
import { productLiveWhere } from "@/lib/product-visibility";
import { productMetadata } from "@/lib/stand-seo";
import { productPublicUrl } from "@/lib/storefront/stand-public-url";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";

/** Farmstand/stand PDP metadata with shop URL as canonical (`/products/…` or `/{cat}/…`). */
export async function standProductPageMetadata(
  standSlug: string,
  productSlug: string,
): Promise<Metadata> {
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
  if (isReservedProductSlug(productKey)) return { title: "Product" };

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      owner: { select: { id: true, businessName: true } },
      products: {
        where: { slug: productKey, ...productLiveWhere },
        take: 1,
        include: { categoryLinks: { select: { categoryId: true } } },
      },
    },
  });
  const product = stand?.products[0];
  if (!stand || !stand.isActive || !product) return { title: "Product" };

  const categories = await prisma.category.findMany({
    where: { ownerId: stand.owner.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, showOnWebsite: true },
  });
  const linked = new Set(product.categoryLinks.map((l) => l.categoryId));
  const mainCategory = pickMainCategory(product.primaryCategoryId, linked, categories);
  const canonicalUrl = await productPublicUrl({
    ownerId: stand.owner.id,
    businessName: stand.owner.businessName || stand.name,
    standSlug: stand.slug,
    productSlug: product.slug,
    categorySlug: mainCategory?.slug,
  });

  return productMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    productName: product.name,
    productSlug: product.slug,
    canonicalUrl,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    description: richTextToPlainOrNull(product.description),
    imageUrl: product.imageUrl,
    isPreOrder: product.isPreOrder,
    collectionNote: product.collectionNote,
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
  });
}

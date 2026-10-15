import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import { productRelativePath } from "@/lib/catalogue/main-category";

/** Title, description and canonical (`/{main-category}/{product}`) for a product page. */
export async function productViewMetadata({
  slug,
  productSlug,
  draft,
}: {
  slug: string;
  productSlug: string;
  draft: boolean;
}): Promise<Metadata> {
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const productKey = decodeURIComponent(productSlug).trim().toLowerCase();
    const product = ctx.products.find((p) => p.slug === productKey);
    const seoRow = product
      ? await prisma.product.findUnique({
          where: { id: product.id },
          select: { seoTitle: true, seoDescription: true },
        })
      : null;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      ctx.storefront.isPublished && !draft,
    );
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      configRaw,
      entityType: "product",
      entityId: product?.id,
      defaults: {
        title: seoRow?.seoTitle ?? product?.name ?? "Product",
        description: seoRow?.seoDescription ?? product?.description ?? product?.name ?? "Product",
        ogImageUrl: product?.imageUrl,
      },
      path: product ? productRelativePath(product.slug, product.mainCategorySlug) : undefined,
    });
  } catch {
    return { title: "Product", robots: { index: false, follow: false } };
  }
}

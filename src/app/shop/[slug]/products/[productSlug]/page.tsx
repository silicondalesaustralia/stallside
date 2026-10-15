import type { Metadata } from "next";
import ProductView from "@/lib/storefront/views/ProductView";
import { productViewMetadata } from "@/lib/storefront/views/product-view-metadata";

type Props = {
  params: Promise<{ slug: string; productSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;
  return productViewMetadata({ slug, productSlug, draft: (await searchParams).draft === "1" });
}

/** `/products/{product}`: uncategorised products; categorised ones redirect to `/{main-category}/{product}`. */
export default async function StorefrontProductPage({ params, searchParams }: Props) {
  const { slug, productSlug } = await params;
  return <ProductView slug={slug} productSlug={productSlug} draft={(await searchParams).draft === "1"} />;
}

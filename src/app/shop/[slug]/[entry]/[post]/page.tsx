import type { Metadata } from "next";
import BlogPostView, { blogPostViewMetadata } from "@/lib/storefront/views/BlogPostView";
import ProductView from "@/lib/storefront/views/ProductView";
import { productViewMetadata } from "@/lib/storefront/views/product-view-metadata";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { resolveStorefrontSlug } from "@/lib/storefront/resolve-site-slug";

type Props = {
  params: Promise<{ slug: string; entry: string; post: string }>;
  searchParams: Promise<{ draft?: string }>;
};

async function resolve({ params, searchParams }: Props) {
  const { slug, entry, post } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const owner = await resolveStorefrontSlug(ctx, entry, draft);
  const postKey = decodeURIComponent(post).trim().toLowerCase();
  const isProduct =
    owner?.kind === "category" || (!owner && ctx.products.some((p) => p.slug === postKey));
  return { slug, post, draft, owner, isProduct };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const { slug, post, draft, isProduct } = await resolve(props);
    if (isProduct) return productViewMetadata({ slug, productSlug: post, draft });
    return blogPostViewMetadata({ slug, postSlug: post, draft });
  } catch {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
}

/**
 * `/{product-category}/{product}` or `/{blog-category}/{post}`. A product under an unknown
 * (renamed or deleted) category redirects to its current address.
 */
export default async function StorefrontNestedEntryPage(props: Props) {
  const { slug, post, draft, owner, isProduct } = await resolve(props);
  if (isProduct) {
    const categorySlug = owner?.kind === "category" ? owner.slug : "";
    return <ProductView slug={slug} productSlug={post} categorySlug={categorySlug} draft={draft} />;
  }
  const { entry } = await props.params;
  return (
    <BlogPostView
      slug={slug}
      topicSlug={decodeURIComponent(entry).trim().toLowerCase()}
      postSlug={post}
      draft={draft}
    />
  );
}

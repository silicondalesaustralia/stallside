import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { resolveStorefrontSlug } from "@/lib/storefront/resolve-site-slug";
import CustomPageView, { customPageViewMetadata } from "@/lib/storefront/views/CustomPageView";
import CategoryView from "@/lib/storefront/views/CategoryView";
import { categoryViewMetadata } from "@/lib/storefront/views/category-view-metadata";
import BlogTopicView, { blogTopicViewMetadata } from "@/lib/storefront/views/BlogTopicView";

type Props = {
  params: Promise<{ slug: string; entry: string }>;
  searchParams: Promise<{ draft?: string }>;
};

async function resolve({ params, searchParams }: Props) {
  const { slug, entry } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  return { slug, draft, owner: await resolveStorefrontSlug(ctx, entry, draft) };
}

const NOT_FOUND_META: Metadata = { title: "Not found", robots: { index: false, follow: false } };

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const { slug, draft, owner } = await resolve(props);
    if (owner?.kind === "page") return customPageViewMetadata({ slug, pageSlug: owner.slug, draft });
    if (owner?.kind === "category") return categoryViewMetadata({ slug, categorySlug: owner.slug, draft });
    if (owner?.kind === "blogCategory") return blogTopicViewMetadata({ slug, topicSlug: owner.slug, draft });
    return NOT_FOUND_META;
  } catch {
    return NOT_FOUND_META;
  }
}

/** `/{slug}`: a custom page, else a product category, else a blog category. */
export default async function StorefrontEntryPage(props: Props) {
  const { slug, draft, owner } = await resolve(props);
  if (owner?.kind === "page") return <CustomPageView slug={slug} pageSlug={owner.slug} draft={draft} />;
  if (owner?.kind === "category") return <CategoryView slug={slug} categorySlug={owner.slug} draft={draft} />;
  if (owner?.kind === "blogCategory") return <BlogTopicView slug={slug} topicSlug={owner.slug} draft={draft} />;
  notFound();
}

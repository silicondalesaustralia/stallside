import type { Metadata } from "next";
import BlogPostView, { blogPostViewMetadata } from "@/lib/storefront/views/BlogPostView";

type Props = {
  params: Promise<{ slug: string; entry: string; post: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, post } = await params;
  return blogPostViewMetadata({ slug, postSlug: post, draft: (await searchParams).draft === "1" });
}

/** `/{blog-category}/{post}`. */
export default async function StorefrontBlogPostPage({ params, searchParams }: Props) {
  const { slug, entry, post } = await params;
  const draft = (await searchParams).draft === "1";
  return (
    <BlogPostView
      slug={slug}
      topicSlug={decodeURIComponent(entry).trim().toLowerCase()}
      postSlug={post}
      draft={draft}
    />
  );
}

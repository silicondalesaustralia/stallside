import type { StorefrontContext } from "@/lib/catalogue/storefront";
import type { StorefrontBlogPost } from "@/lib/studio/blog";
import { blogPostRelativePath } from "@/lib/studio/blog-topics";
import { itemListNode } from "./graph/content";
import { siteUrl, type PageSeo } from "./graph/page-graph";

type Topics = Parameters<typeof blogPostRelativePath>[1];

/** Blog index or blog category: a CollectionPage listing its published posts. */
export function blogListSeo(
  ctx: NonNullable<StorefrontContext>,
  input: {
    path: string;
    name: string;
    trail?: { label: string; path?: string }[];
    posts: StorefrontBlogPost[];
    topics: Topics;
    faq?: PageSeo["faq"];
  },
): PageSeo {
  const posts = input.posts.filter((p) => p.status === "published");
  return {
    path: input.path,
    type: "CollectionPage",
    name: input.name,
    faq: input.faq,
    breadcrumb: [
      { label: ctx.branding.headline, path: "/" },
      ...(input.trail ?? []),
      { label: input.name },
    ],
    nodes: [
      (page) =>
        itemListNode(
          page.pageUrl,
          posts.slice(0, 100).map((p) => ({
            name: p.title,
            url: siteUrl(page, blogPostRelativePath(p, input.topics)),
          })),
        ),
    ],
  };
}

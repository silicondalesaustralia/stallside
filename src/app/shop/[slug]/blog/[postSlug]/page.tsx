import { notFound } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { loadBlogPostFromContext, loadBlogTopicsFromContext } from "@/lib/studio/load-blog";
import { blogPostRelativePath } from "@/lib/studio/blog-topics";
import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

/** Old `/blog/{post}` URLs → `/{main-category}/{post}`. */
export default async function LegacyBlogPostRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, postSlug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const post = loadBlogPostFromContext(ctx, postSlug, draft);
  if (!post) notFound();
  return redirectWithinStorefront(slug, blogPostRelativePath(post, loadBlogTopicsFromContext(ctx, draft)), draft);
}

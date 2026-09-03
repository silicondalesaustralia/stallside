import Image from "next/image";
import Link from "next/link";
import { shopBlogPath } from "@/lib/storefront/paths";
import { SIGN_HTML_CONTENT_STYLE } from "@/lib/sign-html-content-style";
import {
  formatBlogDate,
  topicsForPost,
  type StorefrontBlogPost,
  type StorefrontBlogTopic,
} from "@/lib/studio/blog";

export default function BlogPostArticle({
  post,
  topics,
  storefrontSlug,
  draft,
  basePath,
  bodyHtml,
  studioActive,
}: {
  post: StorefrontBlogPost;
  topics: StorefrontBlogTopic[];
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  bodyHtml: string;
  studioActive?: boolean;
}) {
  const postTopics = topicsForPost(topics, post);
  const date = formatBlogDate(post.publishedAt ?? post.updatedAt);
  const headingClass = studioActive
    ? "studio-heading"
    : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)] sm:text-4xl";

  return (
    <article className="storefront-page-content storefront-page-content--narrow">
      <p className="text-sm">
        <Link href={shopBlogPath(storefrontSlug, draft, basePath)} className="font-semibold text-[var(--leaf-dark)] underline">
          ← Blog
        </Link>
      </p>
      {post.status === "draft" && draft ? (
        <span className="mt-4 inline-flex rounded-full bg-[var(--wash)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          Draft preview — not visible to customers
        </span>
      ) : null}
      {postTopics.length > 0 ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
          {postTopics.map((t) => t.name).join(" · ")}
        </p>
      ) : null}
      <h1 className={`mt-3 ${headingClass}`}>{post.title}</h1>
      {date ? <p className="mt-3 text-sm text-[var(--muted)]">{date}</p> : null}
      {post.featuredImageUrl ? (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-[var(--wash)]">
          <Image src={post.featuredImageUrl} alt="" fill className="object-cover" sizes="720px" priority />
        </div>
      ) : null}
      {post.excerpt ? (
        <p className="mt-8 text-lg leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
      ) : null}
      {bodyHtml ? (
        <div
          className="blog-article-body mt-8 space-y-4 text-[var(--field)] leading-relaxed [&_a]:text-[var(--leaf-dark)] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : (
        <p className="mt-8 text-[var(--muted)]">This post has no content yet.</p>
      )}
      <style>{`.blog-article-body { ${SIGN_HTML_CONTENT_STYLE} }`}</style>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { shopBlogPostPath } from "@/lib/storefront/paths";
import {
  formatBlogDate,
  topicsForPost,
  type StorefrontBlogPost,
  type StorefrontBlogTopic,
} from "@/lib/studio/blog";

export default function BlogPostIndex({
  posts,
  topics,
  storefrontSlug,
  draft,
  basePath,
  indexTitle,
  studioActive,
}: {
  posts: StorefrontBlogPost[];
  topics: StorefrontBlogTopic[];
  storefrontSlug: string;
  draft?: boolean;
  basePath?: string;
  indexTitle: string;
  studioActive?: boolean;
}) {
  const headingClass = studioActive
    ? "studio-heading"
    : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]";

  return (
    <section className="storefront-page-content">
      {!studioActive ? <h1 className={headingClass}>{indexTitle}</h1> : null}
      {posts.length === 0 ? (
        <p className="mt-8 text-lg text-[var(--muted)]">No posts yet — check back soon.</p>
      ) : (
        <ul className={`grid gap-8 ${studioActive ? "" : "mt-10"} sm:grid-cols-2`}>
          {posts.map((post) => {
            const postTopics = topicsForPost(topics, post);
            const href = shopBlogPostPath(storefrontSlug, post.slug, draft, basePath);
            const date = formatBlogDate(post.publishedAt ?? post.updatedAt);
            return (
              <li key={post.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                {post.featuredImageUrl ? (
                  <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[var(--wash)]">
                    <Image
                      src={post.featuredImageUrl}
                      alt=""
                      fill
                      className="object-cover transition hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </Link>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  {post.status === "draft" && draft ? (
                    <span className="mb-2 inline-flex w-fit rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
                      Draft preview
                    </span>
                  ) : null}
                  {postTopics.length > 0 ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
                      {postTopics.map((t) => t.name).join(" · ")}
                    </p>
                  ) : null}
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
                    <Link href={href} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  {date ? <p className="mt-2 text-sm text-[var(--muted)]">{date}</p> : null}
                  {post.excerpt ? (
                    <p className="mt-3 flex-1 text-[var(--muted)] leading-relaxed">{post.excerpt}</p>
                  ) : null}
                  <Link href={href} className="mt-4 text-sm font-semibold text-[var(--leaf-dark)] underline">
                    Read more
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

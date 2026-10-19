import Link from "next/link";
import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { newsArticlePath } from "@/lib/farms-stand-news/paths";

export type BlogListItem = Pick<NewsArticle, "slug" | "title" | "excerpt" | "canonicalPath"> & {
  publishedAt?: string;
};

function formatListDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BlogArticleList({
  items,
  emptyText = "New articles are on the way. Check back soon.",
}: {
  items: BlogListItem[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="mt-12 text-[var(--muted)]">{emptyText}</p>;
  }

  return (
    <ul className="mt-12 flex flex-col gap-10">
      {items.map((item) => {
        const href = item.canonicalPath ?? newsArticlePath(item.slug);
        return (
          <li key={href}>
            <article>
              {item.publishedAt ? (
                <p className="text-sm text-[var(--muted)]">
                  <time dateTime={item.publishedAt}>{formatListDate(item.publishedAt)}</time>
                </p>
              ) : null}
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)] sm:text-2xl">
                <Link href={href} className="transition hover:text-[var(--leaf-dark)]">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-2 text-base leading-relaxed text-[var(--ink)]">{item.excerpt}</p>
              <p className="mt-3">
                <Link
                  href={href}
                  className="text-sm font-semibold text-[var(--leaf-dark)] underline"
                >
                  Read more
                </Link>
              </p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

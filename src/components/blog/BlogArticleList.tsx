import type { NewsArticle } from "@/lib/farms-stand-news/types";
import BlogArticleCard from "./BlogArticleCard";

export type BlogListItem = Pick<NewsArticle, "slug" | "title" | "excerpt" | "canonicalPath"> & {
  publishedAt?: string;
  image?: { src: string; alt: string };
};

const GRID_COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

export default function BlogArticleList({
  items,
  emptyText = "New articles are on the way. Check back soon.",
  columns = 3,
}: {
  items: BlogListItem[];
  emptyText?: string;
  columns?: keyof typeof GRID_COLUMNS;
}) {
  if (items.length === 0) {
    return <p className="mt-12 text-[var(--muted)]">{emptyText}</p>;
  }

  return (
    <ul className={`mt-10 grid gap-6 ${GRID_COLUMNS[columns]}`}>
      {items.map((item) => (
        <li key={item.canonicalPath ?? item.slug}>
          <BlogArticleCard item={item} />
        </li>
      ))}
    </ul>
  );
}

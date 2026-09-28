import Link from "next/link";
import { standCategoryPath } from "@/lib/stand-seo";

/** Above this many categories, collapse into a dropdown. */
export const INLINE_CATEGORY_LIMIT = 4;

export default function StandCategoryNav({
  standSlug,
  categories,
  onNavigate,
}: {
  standSlug: string;
  categories: { slug: string; title: string }[];
  onNavigate?: () => void;
}) {
  if (categories.length === 0) return null;

  if (categories.length <= INLINE_CATEGORY_LIMIT) {
    return (
      <>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={standCategoryPath(standSlug, c.slug)}
            onClick={onNavigate}
            className="text-[var(--leaf-dark)] underline"
          >
            {c.title}
          </Link>
        ))}
      </>
    );
  }

  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none text-[var(--leaf-dark)] underline [&::-webkit-details-marker]:hidden">
        Categories <span aria-hidden className="inline-block transition group-open:rotate-180">▾</span>
      </summary>
      <div className="absolute left-1/2 top-full z-20 mt-2 flex max-h-80 w-56 -translate-x-1/2 flex-col overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1 text-left shadow-lg">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={standCategoryPath(standSlug, c.slug)}
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--wash)]"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </details>
  );
}

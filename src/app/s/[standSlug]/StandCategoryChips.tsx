import Link from "next/link";
import { standCatalogPath, standCategoryPath } from "@/lib/stand-seo";

function chipClass(active: boolean) {
  return `inline-block max-w-[13rem] shrink-0 snap-start truncate whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
    active
      ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
      : "border-[var(--line)] bg-[var(--panel)] text-[var(--field)] hover:bg-[var(--wash)]"
  }`;
}

/** Horizontally scrolling category filter above the product grid. */
export default function StandCategoryChips({
  standSlug,
  categories,
  activeSlug,
}: {
  standSlug: string;
  categories: { slug: string; title: string }[];
  activeSlug: string | null;
}) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label="Categories" className="-mx-4 mt-6">
      <ul className="flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link
            href={standCatalogPath(standSlug)}
            aria-current={activeSlug == null ? "page" : undefined}
            className={chipClass(activeSlug == null)}
          >
            All
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={standCategoryPath(standSlug, c.slug)}
              aria-current={c.slug === activeSlug ? "page" : undefined}
              title={c.title}
              className={chipClass(c.slug === activeSlug)}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

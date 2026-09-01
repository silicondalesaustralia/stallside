"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function StandCategoryChips({
  standSlug,
  categories,
}: {
  standSlug: string;
  categories: { slug: string; title: string }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  if (categories.length === 0) return null;

  function hrefFor(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        href={hrefFor()}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          !active
            ? "bg-[var(--leaf)] text-white"
            : "bg-[var(--panel)] text-[var(--muted)] outline outline-[var(--line)]"
        }`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={hrefFor(c.slug)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            active === c.slug
              ? "bg-[var(--leaf)] text-white"
              : "bg-[var(--panel)] text-[var(--muted)] outline outline-[var(--line)]"
          }`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function StorefrontCategoryChips({
  storefrontSlug,
  categories,
  draft,
}: {
  storefrontSlug: string;
  categories: { slug: string; title: string }[];
  draft?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  if (categories.length === 0) return null;

  function hrefFor(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    if (draft) params.set("draft", "1");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor()}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          !active
            ? "bg-[var(--leaf)] text-white"
            : "bg-[var(--wash)] text-[var(--muted)]"
        }`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={hrefFor(c.slug)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            active === c.slug
              ? "bg-[var(--leaf)] text-white"
              : "bg-[var(--wash)] text-[var(--muted)]"
          }`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { shopCategoryPath, shopPagePath } from "@/lib/storefront/paths";

export default function StorefrontCategoryChips({
  storefrontSlug,
  categories,
  draft,
  basePath,
  activeSlug,
}: {
  storefrontSlug: string;
  categories: { slug: string; title: string }[];
  draft?: boolean;
  basePath?: string;
  activeSlug?: string | null;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={shopPagePath(storefrontSlug, "shop", draft, basePath)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          !activeSlug
            ? "bg-[var(--leaf)] text-white"
            : "bg-[var(--wash)] text-[var(--muted)]"
        }`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={shopCategoryPath(storefrontSlug, c.slug, draft, basePath)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            activeSlug === c.slug
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

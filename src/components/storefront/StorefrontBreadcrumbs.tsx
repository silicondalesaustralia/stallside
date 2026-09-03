import Link from "next/link";
import type { StorefrontBreadcrumbItem } from "@/lib/storefront/technical-seo/breadcrumbs";

export default function StorefrontBreadcrumbs({
  items,
  studioActive,
}: {
  items: StorefrontBreadcrumbItem[];
  studioActive?: boolean;
}) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={
        studioActive
          ? "storefront-page-content storefront-page-content--wide pb-0 pt-6"
          : "mx-auto max-w-5xl px-4 pt-6 sm:px-6"
      }
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="font-medium text-[var(--leaf-dark)] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-[var(--field)]" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

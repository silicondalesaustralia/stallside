import Link from "next/link";
import { Search } from "lucide-react";
import GuideCategoryIcon from "@/components/knowledge/GuideCategoryIcon";
import type { KnowledgeCategory } from "@/lib/knowledge-base";

type GuideSidebarProps = {
  categories: KnowledgeCategory[];
  currentSlug: string;
  currentCategoryId: string;
};

export default function GuideSidebar({
  categories,
  currentSlug,
  currentCategoryId,
}: GuideSidebarProps) {
  return (
    <nav aria-label="All guides" className="flex flex-col gap-4">
      <form action="/dashboard/knowledge" className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          type="search"
          name="q"
          placeholder="Search guides"
          aria-label="Search guides"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--leaf)]"
        />
      </form>
      <ul className="flex flex-col gap-1">
        {categories.map((category) => (
          <li key={category.id}>
            <details open={category.id === currentCategoryId} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--panel)]">
                <GuideCategoryIcon name={category.icon} className="size-4 text-[var(--leaf-dark)]" />
                {category.title}
              </summary>
              <ul className="mb-2 ml-4 mt-1 flex flex-col border-l border-[var(--line)]">
                {category.articles.map((article) => {
                  const active = article.slug === currentSlug;
                  return (
                    <li key={article.slug}>
                      <Link
                        href={`/dashboard/knowledge/${article.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={`-ml-px block border-l-2 py-1 pl-3 text-sm ${
                          active
                            ? "border-[var(--leaf)] font-medium text-[var(--leaf-dark)]"
                            : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {article.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </nav>
  );
}

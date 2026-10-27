import Link from "next/link";
import GuideCategoryIcon from "@/components/knowledge/GuideCategoryIcon";
import type { KnowledgeCategory } from "@/lib/knowledge-base";

type GuideCategoryGridProps = {
  categories: KnowledgeCategory[];
};

export default function GuideCategoryGrid({ categories }: GuideCategoryGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="flex scroll-mt-24 flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--wash)] text-[var(--leaf-dark)]">
              <GuideCategoryIcon name={category.icon} />
            </span>
            <div>
              <h2 className="font-semibold text-[var(--ink)]">{category.title}</h2>
              <p className="mt-0.5 text-sm text-[var(--muted)]">{category.description}</p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col border-t border-[var(--line)] pt-3">
            {category.articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/dashboard/knowledge/${article.slug}`}
                  className="-mx-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--ink)] hover:bg-[var(--wash)] hover:text-[var(--leaf-dark)]"
                >
                  <span>{article.title}</span>
                  {article.availability ? (
                    <span className="shrink-0 text-xs text-[var(--muted)]">
                      {article.availability}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

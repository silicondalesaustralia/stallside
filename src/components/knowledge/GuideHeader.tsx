import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { KnowledgeArticle, KnowledgeCategory } from "@/lib/knowledge-base";

type GuideHeaderProps = {
  article: KnowledgeArticle;
  category: KnowledgeCategory;
};

export default function GuideHeader({ article, category }: GuideHeaderProps) {
  return (
    <header>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[var(--muted)]">
        <Link href="/dashboard/knowledge" className="hover:text-[var(--ink)] hover:underline">
          Guides
        </Link>
        <ChevronRight aria-hidden className="size-3.5" />
        <Link
          href={`/dashboard/knowledge#${category.id}`}
          className="hover:text-[var(--ink)] hover:underline"
        >
          {category.title}
        </Link>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        {article.title}
      </h1>
      <p className="mt-2 text-lg leading-relaxed text-[var(--muted)]">{article.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        {article.availability ? (
          <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[var(--ink)]">
            {article.availability}
          </span>
        ) : null}
        <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[var(--muted)]">
          {article.steps.length} steps
        </span>
      </div>
      {article.ctas.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {article.ctas.map((cta, index) => (
            <Link
              key={cta.href + cta.label}
              href={cta.href}
              className={
                index === 0
                  ? "rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
                  : "rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--leaf)]"
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

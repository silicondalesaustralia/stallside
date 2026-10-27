import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { KnowledgeArticle } from "@/lib/knowledge-base";

type GuideStartHereProps = {
  articles: KnowledgeArticle[];
};

export default function GuideStartHere({ articles }: GuideStartHereProps) {
  if (!articles.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Start here
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/dashboard/knowledge/${article.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--leaf)]"
            >
              <span className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                {article.title}
                {article.videoUrl ? (
                  <PlayCircle aria-label="Has video" className="size-4 text-[var(--leaf)]" />
                ) : null}
              </span>
              <span className="mt-1 flex-1 text-sm text-[var(--muted)]">{article.summary}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--leaf-dark)]">
                Read guide
                <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

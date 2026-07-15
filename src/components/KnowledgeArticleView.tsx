import Link from "next/link";
import KnowledgeVideo from "@/components/KnowledgeVideo";
import type { KnowledgeArticle } from "@/lib/knowledge-base";
import { getRelatedArticles } from "@/lib/knowledge-base";

type KnowledgeArticleViewProps = {
  article: KnowledgeArticle;
};

export default function KnowledgeArticleView({ article }: KnowledgeArticleViewProps) {
  const related = getRelatedArticles(article);

  return (
    <article className="flex max-w-3xl flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/knowledge" className="underline">
            Guides
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{article.title}</h1>
        <p className="mt-2 text-[var(--muted)]">{article.summary}</p>
        {article.comingSoon ? (
          <p className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-[var(--wash)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            Coming soon
          </p>
        ) : null}
      </div>

      <KnowledgeVideo videoUrl={article.videoUrl} title={article.title} />

      <section>
        <h2 className="text-lg font-semibold">How to</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--ink)]">
          {article.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {article.ctas.length ? (
        <div className="flex flex-wrap gap-3">
          {article.ctas.map((cta) => (
            <Link
              key={cta.href + cta.label}
              href={cta.href}
              className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      ) : null}

      {related.length ? (
        <section className="border-t border-[var(--line)] pt-6">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/dashboard/knowledge/${item.slug}`}
                  className="font-medium text-[var(--leaf-dark)] underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

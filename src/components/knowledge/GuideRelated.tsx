import Link from "next/link";
import type { KnowledgeArticle } from "@/lib/knowledge-base";

type GuideRelatedProps = {
  articles: KnowledgeArticle[];
};

export default function GuideRelated({ articles }: GuideRelatedProps) {
  if (!articles.length) return null;

  return (
    <section className="border-t border-[var(--line)] pt-6">
      <h2 className="text-lg font-semibold">Related guides</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {articles.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/dashboard/knowledge/${item.slug}`}
              className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 hover:border-[var(--leaf)]"
            >
              <span className="font-medium text-[var(--ink)]">{item.title}</span>
              <span className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

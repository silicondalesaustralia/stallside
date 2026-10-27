import type { Metadata } from "next";
import GuideCategoryGrid from "@/components/knowledge/GuideCategoryGrid";
import GuideSearch from "@/components/knowledge/GuideSearch";
import GuideStartHere from "@/components/knowledge/GuideStartHere";
import { getStartHereArticles, listCategories } from "@/lib/knowledge-base";
import { buildSearchIndex } from "@/lib/knowledge-base/search";
import { requireOwner } from "@/lib/session";

export const metadata: Metadata = { title: "Guides" };

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function KnowledgeIndexPage({ searchParams }: PageProps) {
  await requireOwner();
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";
  const categories = listCategories();
  const articleCount = categories.reduce((sum, c) => sum + c.articles.length, 0);

  return (
    <main className="flex flex-col gap-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Guides</h1>
        <p className="mt-2 text-[var(--muted)]">
          {articleCount} step-by-step guides for every part of Vendl, from your first sale to
          payments, pre-orders, social posts, and production costs.
        </p>
      </div>

      <GuideSearch entries={buildSearchIndex(categories)} initialQuery={initialQuery}>
        <div className="flex flex-col gap-10">
          <GuideStartHere articles={getStartHereArticles()} />
          <GuideCategoryGrid categories={categories} />
        </div>
      </GuideSearch>
    </main>
  );
}

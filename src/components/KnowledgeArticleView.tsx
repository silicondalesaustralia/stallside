import Image from "next/image";
import KnowledgeVideo from "@/components/KnowledgeVideo";
import GuideHeader from "@/components/knowledge/GuideHeader";
import GuidePager from "@/components/knowledge/GuidePager";
import GuideRelated from "@/components/knowledge/GuideRelated";
import GuideSidebar from "@/components/knowledge/GuideSidebar";
import GuideSteps from "@/components/knowledge/GuideSteps";
import type { KnowledgeArticleContext } from "@/lib/knowledge-base";
import { getRelatedArticles, listCategories } from "@/lib/knowledge-base";

type KnowledgeArticleViewProps = {
  context: KnowledgeArticleContext;
};

export default function KnowledgeArticleView({ context }: KnowledgeArticleViewProps) {
  const { article, category, previous, next } = context;
  const categories = listCategories();
  const sidebar = (
    <GuideSidebar
      categories={categories}
      currentSlug={article.slug}
      currentCategoryId={category.id}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pb-6 pr-2">
          {sidebar}
        </div>
      </aside>

      <article className="flex max-w-3xl flex-col gap-8">
        <details className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
            Browse all guides
          </summary>
          <div className="mt-3">{sidebar}</div>
        </details>

        <GuideHeader article={article} category={category} />

        {article.videoUrl ? (
          <KnowledgeVideo videoUrl={article.videoUrl} title={article.title} />
        ) : null}

        {article.imageSrc ? (
          <figure className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
            <Image
              src={article.imageSrc}
              alt={article.imageAlt ?? ""}
              width={article.imageWidth ?? 800}
              height={article.imageHeight ?? 600}
              className={
                (article.imageWidth ?? 0) >= (article.imageHeight ?? 0)
                  ? "mx-auto h-auto w-full max-w-2xl object-contain"
                  : "mx-auto h-auto w-full max-w-xs object-contain"
              }
              sizes="(max-width: 768px) 100vw, 42rem"
              priority
            />
          </figure>
        ) : null}

        <GuideSteps steps={article.steps} tips={article.tips} />
        <GuideRelated articles={getRelatedArticles(article)} />
        <GuidePager previous={previous} next={next} />
      </article>
    </div>
  );
}

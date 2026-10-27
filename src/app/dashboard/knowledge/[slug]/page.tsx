import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KnowledgeArticleView from "@/components/KnowledgeArticleView";
import { getArticle, getArticleContext } from "@/lib/knowledge-base";
import { requireOwner } from "@/lib/session";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article ? `${article.title} · Guides` : "Guides" };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  await requireOwner();
  const { slug } = await params;
  const context = getArticleContext(slug);
  if (!context) notFound();

  return (
    <main>
      <KnowledgeArticleView context={context} />
    </main>
  );
}

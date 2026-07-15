import { notFound } from "next/navigation";
import KnowledgeArticleView from "@/components/KnowledgeArticleView";
import { getArticle } from "@/lib/knowledge-base";
import { requireOwner } from "@/lib/session";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function KnowledgeArticlePage({ params }: PageProps) {
  await requireOwner();
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <main>
      <KnowledgeArticleView article={article} />
    </main>
  );
}

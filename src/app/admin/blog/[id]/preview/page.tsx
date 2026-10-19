import { notFound } from "next/navigation";
import NewsArticleView from "@/components/NewsArticleView";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { blogPostToNewsArticle } from "@/lib/blog/to-news-article";

/** Draft preview using the real public article layout. */
export default async function AdminBlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="rounded-2xl bg-white">
      <p className="rounded-t-2xl bg-amber-50 px-4 py-2 text-sm text-amber-900">
        Preview · {post.status.toLowerCase()} · not visible to the public until published
      </p>
      <NewsArticleView article={blogPostToNewsArticle(post)} />
    </div>
  );
}

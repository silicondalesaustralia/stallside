import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import NewsArticleView from "@/components/NewsArticleView";
import { SITE_URL } from "@/lib/legal";
import {
  getArticle,
  getArticleSlugs,
  newsArticleGraphSchema,
  newsArticlePath,
} from "@/lib/farms-stand-news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article" };

  const path = newsArticlePath(article.slug);
  const canonical = `${SITE_URL}${path}`;

  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      title: article.seoTitle,
      description: article.seoDescription,
      url: canonical,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
      ...(article.image
        ? {
            images: [
              {
                url: article.image.src,
                width: article.image.width,
                height: article.image.height,
                alt: article.image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.seoDescription,
      ...(article.image ? { images: [article.image.src] } : {}),
    },
  };
}

export default async function FarmsStandNewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <MarketingPageShell>
      <JsonLd data={newsArticleGraphSchema(article)} />
      <NewsArticleView article={article} />
    </MarketingPageShell>
  );
}

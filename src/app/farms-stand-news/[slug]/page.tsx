import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import ArticleLayout from "@/components/blog/ArticleLayout";
import { SITE_URL } from "@/lib/legal";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import {
  getArticle,
  getArticleSlugs,
  newsArticleGraphSchema,
  newsArticlePath,
} from "@/lib/farms-stand-news";
import { findLiveBlogSection } from "@/lib/blog/queries";
import { guidePath } from "@/lib/blog/paths";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article" };

  const path = article.canonicalPath ?? newsArticlePath(article.slug);
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
      images: [
        article.image
          ? {
              url: article.image.src,
              width: article.image.width,
              height: article.image.height,
              alt: article.image.alt,
            }
          : DEFAULT_OG_IMAGE,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.seoDescription,
      images: [article.image ? article.image.src : DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function FarmsStandNewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    if ((await findLiveBlogSection(slug)) === "GUIDE") permanentRedirect(guidePath(slug));
    notFound();
  }

  return (
    <MarketingPageShell>
      <JsonLd data={newsArticleGraphSchema(article)} />
      <ArticleLayout article={article} />
    </MarketingPageShell>
  );
}

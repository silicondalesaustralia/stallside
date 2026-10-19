import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import NewsArticleView from "@/components/NewsArticleView";
import { SITE_URL } from "@/lib/legal";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import { newsArticleGraphSchema, newsArticlePath } from "@/lib/farms-stand-news";
import { getGuide } from "@/lib/blog/guides";
import { guidePath } from "@/lib/blog/paths";
import { findLiveBlogSection } from "@/lib/blog/queries";

/** The marketing header reads the session cookie, so these pages can't be statically cached. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Guide" };

  const path = guidePath(guide.slug);
  const image = guide.image
    ? { url: guide.image.src, width: guide.image.width, height: guide.image.height, alt: guide.image.alt }
    : DEFAULT_OG_IMAGE;

  return {
    title: guide.seoTitle,
    description: guide.seoDescription,
    keywords: guide.keywords,
    alternates: { canonical: path },
    openGraph: {
      title: guide.seoTitle,
      description: guide.seoDescription,
      url: `${SITE_URL}${path}`,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt ?? guide.publishedAt,
      authors: [guide.author.name],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.seoTitle,
      description: guide.seoDescription,
      images: [guide.image ? guide.image.src : DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) {
    if ((await findLiveBlogSection(slug)) === "NEWS") permanentRedirect(newsArticlePath(slug));
    notFound();
  }

  return (
    <MarketingPageShell>
      <JsonLd data={newsArticleGraphSchema(guide)} />
      <NewsArticleView article={guide} />
    </MarketingPageShell>
  );
}

import { SITE_URL } from "@/lib/legal";
import type { NewsArticleMeta } from "./types";

export function blogPostingNode(
  article: NewsArticleMeta,
  postUrl: string,
  authorId: string,
  imageUrl: string | undefined,
  datePublished: string,
  dateModified: string,
) {
  const about = (article.comparedSoftware ?? []).map((app) => ({
    "@id": `${postUrl}#${app.id}`,
  }));

  return {
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    isPartOf: { "@id": `${postUrl}#webpage` },
    mainEntityOfPage: { "@id": `${postUrl}#webpage` },
    headline: article.title,
    ...(article.alternativeHeadline
      ? { alternativeHeadline: article.alternativeHeadline }
      : {}),
    description: article.seoDescription,
    ...(imageUrl ? { image: { "@id": `${postUrl}#primaryimage` } } : {}),
    author: { "@id": authorId },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished,
    dateModified,
    ...(article.articleSection
      ? { articleSection: article.articleSection }
      : {}),
    ...(article.keywords ? { keywords: article.keywords } : {}),
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    inLanguage: "en-AU",
    ...(about.length ? { about } : {}),
    ...(article.mentions?.length
      ? {
          mentions: article.mentions.map((m) => ({
            "@type": m.type ?? "Thing",
            name: m.name,
            ...(m.sameAs ? { sameAs: m.sameAs } : {}),
          })),
        }
      : {}),
    ...(article.citations?.length
      ? {
          citation: article.citations.map((c) => ({
            "@type": "WebPage",
            name: c.name,
            url: c.url,
          })),
        }
      : {}),
    ...(article.audienceType
      ? {
          audience: {
            "@type": "BusinessAudience",
            audienceType: article.audienceType,
          },
        }
      : {}),
    ...(article.hasPart?.length
      ? {
          hasPart: article.hasPart.map((part) => ({
            "@type": "WebPageElement",
            isAccessibleForFree: true,
            name: part.name,
            cssSelector: part.cssSelector,
          })),
        }
      : {}),
  };
}

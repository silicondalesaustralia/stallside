import type { GuideResponse, GuidesResponse, MobileGuideSummary } from "@/contracts/mobile/guides";
import { getRelatedArticles, listCategories, type KnowledgeArticle } from "@/lib/knowledge-base";

/** App Store rules bar pointing iOS users at web billing; /login means nothing inside the app. */
const HIDDEN_LINKS = ["/dashboard/settings/billing", "/login"];

function toSummary(article: KnowledgeArticle): MobileGuideSummary {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    hasVideo: Boolean(article.videoUrl),
    comingSoon: article.availability === "Coming soon",
  };
}

export function toGuidesResponse(): GuidesResponse {
  return {
    categories: listCategories().map((category) => ({
      id: category.id,
      title: category.title,
      guides: category.articles.map(toSummary),
    })),
  };
}

export function toGuideResponse(article: KnowledgeArticle): GuideResponse {
  const { imageSrc, imageWidth, imageHeight } = article;
  return {
    guide: toSummary(article),
    videoUrl: article.videoUrl ?? null,
    image: imageSrc
      ? {
          path: imageSrc,
          alt: article.imageAlt ?? "",
          aspectRatio: imageWidth && imageHeight ? imageWidth / imageHeight : null,
        }
      : null,
    steps: [...article.steps, ...(article.tips ?? [])],
    links: article.ctas.filter((cta) => !HIDDEN_LINKS.includes(cta.href)),
    related: getRelatedArticles(article).map(toSummary),
  };
}

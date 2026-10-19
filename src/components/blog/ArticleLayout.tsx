import NewsArticleView from "@/components/NewsArticleView";
import type { StandPhoto } from "@/components/gallery/StandPhotoTile";
import { GalleryStatus } from "@/generated/prisma/client";
import type { NewsArticle } from "@/lib/farms-stand-news/types";
import { getRelatedArticles } from "@/lib/blog/related-articles";
import { featuredStands } from "@/lib/featured-stands";
import { prisma } from "@/lib/prisma";
import { testimonials } from "@/lib/testimonials";
import ArticleKeepReading from "./ArticleKeepReading";
import ArticleSidebar from "./ArticleSidebar";
import BlogEmailSignup from "./BlogEmailSignup";

const KEEP_READING_COUNT = 3;
const SIDEBAR_RELATED_COUNT = 4;

const STAND_PHOTO_COUNT = 4;
const SIDEBAR_TESTIMONIAL_ID = "fletchers-donnybrook";

const FEATURED_PHOTOS: StandPhoto[] = featuredStands.flatMap((stand) =>
  stand.images.map((image, i) => ({
    id: `${stand.id}-${i}`,
    imageUrl: image.src,
    displayName: stand.name,
    location: stand.location,
    caption: null,
  })),
);

/** Featured stand photos first, then approved gallery submissions. */
async function loadStandPhotos(): Promise<StandPhoto[]> {
  const featured = FEATURED_PHOTOS.slice(0, STAND_PHOTO_COUNT);
  if (featured.length === STAND_PHOTO_COUNT) return featured;
  try {
    const gallery = await prisma.galleryStand.findMany({
      where: { status: GalleryStatus.APPROVED },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: STAND_PHOTO_COUNT - featured.length,
      select: { id: true, imageUrl: true, displayName: true, location: true, caption: true },
    });
    return [...featured, ...gallery];
  } catch (error) {
    console.error("[blog] failed to load stand photos", error);
    return featured;
  }
}

/** Article with a sidebar (contents, related guides, features, stands) and reader follow-ups below. */
export default async function ArticleLayout({ article }: { article: NewsArticle }) {
  const [related, photos] = await Promise.all([
    getRelatedArticles(article, KEEP_READING_COUNT + SIDEBAR_RELATED_COUNT),
    loadStandPhotos(),
  ]);
  const rest = related.slice(KEEP_READING_COUNT);
  const sidebarRelated = rest.length >= 2 ? rest : related.slice(0, SIDEBAR_RELATED_COUNT);
  const testimonial = testimonials.find((t) => t.id === SIDEBAR_TESTIMONIAL_ID) ?? testimonials[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
      <NewsArticleView article={article} layout="column">
        <BlogEmailSignup slug={article.slug} />
        <ArticleKeepReading items={related.slice(0, KEEP_READING_COUNT)} />
      </NewsArticleView>
      <ArticleSidebar
        slug={article.slug}
        headings={article.headings ?? []}
        related={sidebarRelated}
        photos={photos}
        testimonial={testimonial}
      />
    </div>
  );
}

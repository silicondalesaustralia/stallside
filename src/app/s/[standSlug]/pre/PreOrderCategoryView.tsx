import { formatOrderByLabel } from "@/lib/pre-order";
import { preOrderPagePath } from "@/lib/preorder-page";
import {
  formatPreorderCollectionDate,
  preorderCategoryCardCopy,
  preorderCategoryIntro,
  preorderHandoverHeading,
} from "@/lib/preorder-category-copy";
import PreOrderCategoryCard from "./PreOrderCategoryCard";
import PreOrderCategoryIntro from "./PreOrderCategoryIntro";
import PreOrderCategoryShell from "./PreOrderCategoryShell";

type Page = {
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  collectionAt: Date;
  orderByAt: Date;
  handoverMode: string;
  fallbackImageUrl: string | null;
};

export default function PreOrderCategoryView({
  standSlug,
  standName,
  timezone,
  accentColor,
  pages,
  pageHrefBase,
}: {
  standSlug: string;
  standName: string;
  timezone: string;
  accentColor?: string | null;
  pages: Page[];
  /** Base for card links, e.g. the website's `/pre-orders`; defaults to the stand page. */
  pageHrefBase?: string;
}) {
  const intro = preorderCategoryIntro(standName);

  return (
    <PreOrderCategoryShell accentColor={accentColor}>
      <PreOrderCategoryIntro
        eyebrow={intro.eyebrow}
        heading={intro.heading}
        intro={intro.intro}
      />
      <ul
        className={
          pages.length === 1
            ? "mx-auto grid w-full max-w-[470px] grid-cols-1 gap-5"
            : "grid grid-cols-1 gap-5 sm:grid-cols-2"
        }
      >
        {pages.map((page) => {
          const copy = preorderCategoryCardCopy({
            standSlug,
            pageSlug: page.slug,
            title: page.title,
            description: page.description,
          });
          return (
            <li key={page.slug} className="min-w-0">
              <PreOrderCategoryCard
                href={
                  pageHrefBase
                    ? `${pageHrefBase}/${encodeURIComponent(page.slug)}`
                    : preOrderPagePath(standSlug, page.slug)
                }
                title={page.title}
                imageUrl={page.imageUrl || page.fallbackImageUrl}
                statusLabel="Pre-order open"
                shortDescription={copy.shortDescription}
                handoverHeading={preorderHandoverHeading(page.handoverMode)}
                dateLabel={formatPreorderCollectionDate(
                  page.collectionAt,
                  timezone,
                )}
                orderByLabel={formatOrderByLabel(page.orderByAt, timezone)}
              />
            </li>
          );
        })}
      </ul>
    </PreOrderCategoryShell>
  );
}

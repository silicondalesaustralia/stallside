import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import BlogArticleList from "@/components/blog/BlogArticleList";
import { APP_NAME } from "@/lib/constants";
import { STATIC_GUIDE_PAGES, getAllGuides } from "@/lib/blog/guides";
import { guidesIndexPath } from "@/lib/blog/paths";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Guides";
const description =
  "Practical guides for home producers, farm stands and small online sellers: payments, pre-orders, inventory, marketing and selling online.";

export const revalidate = 3600;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: guidesIndexPath() },
  openGraph: {
    title: `${title} · ${APP_NAME}`,
    description,
    url: guidesIndexPath(),
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: guidesIndexPath(),
          name: `${title} · ${APP_NAME}`,
          description,
          type: "CollectionPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Guides
        </h1>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          How-tos for selling at the stand, online and everywhere in between.
        </p>

        <BlogArticleList items={[...guides, ...STATIC_GUIDE_PAGES]} />
      </main>
    </MarketingPageShell>
  );
}

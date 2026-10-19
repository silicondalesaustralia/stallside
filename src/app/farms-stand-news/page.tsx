import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import BlogArticleList from "@/components/blog/BlogArticleList";
import { APP_NAME } from "@/lib/constants";
import { getAllArticles } from "@/lib/farms-stand-news";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Farm Stand News";
const description =
  "News, guides, and updates for farm stand and honesty stall owners from Vendl.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/farms-stand-news" },
  openGraph: {
    title: `${title} · ${APP_NAME}`,
    description,
    url: "/farms-stand-news",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 3600;

export default async function FarmsStandNewsPage() {
  const articles = await getAllArticles();

  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/farms-stand-news",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "CollectionPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Farm Stand News
        </h1>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          Guides and updates for people running unattended stands.
        </p>

        <BlogArticleList items={articles} />
      </main>
    </MarketingPageShell>
  );
}

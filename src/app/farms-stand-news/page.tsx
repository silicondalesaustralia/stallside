import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { getAllArticles, newsArticlePath } from "@/lib/farms-stand-news";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Farm Stand News";
const description =
  "News, guides, and updates for farm stand and honesty stall owners from Stallside.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/farms-stand-news" },
  openGraph: {
    title: `${title} · ${APP_NAME}`,
    description,
    url: "/farms-stand-news",
    type: "website",
  },
};

function formatListDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function FarmsStandNewsPage() {
  const articles = getAllArticles();

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

        {articles.length === 0 ? (
          <p className="mt-12 text-[var(--muted)]">
            New articles are on the way. Check back soon.
          </p>
        ) : (
          <ul className="mt-12 flex flex-col gap-10">
            {articles.map((article) => (
              <li key={article.slug}>
                <article>
                  <p className="text-sm text-[var(--muted)]">
                    <time dateTime={article.publishedAt}>
                      {formatListDate(article.publishedAt)}
                    </time>
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)] sm:text-2xl">
                    <Link
                      href={newsArticlePath(article.slug)}
                      className="transition hover:text-[var(--leaf-dark)]"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--ink)]">
                    {article.excerpt}
                  </p>
                  <p className="mt-3">
                    <Link
                      href={newsArticlePath(article.slug)}
                      className="text-sm font-semibold text-[var(--leaf-dark)] underline"
                    >
                      Read more
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </MarketingPageShell>
  );
}

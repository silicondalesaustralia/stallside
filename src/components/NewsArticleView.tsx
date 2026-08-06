import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/lib/farms-stand-news";
import { newsIndexPath } from "@/lib/farms-stand-news";

function formatPublishedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function NewsArticleView({ article }: { article: NewsArticle }) {
  const { Content } = article;
  const modified = article.updatedAt ?? article.publishedAt;
  const showHero =
    Boolean(article.image) && article.featuredImagePlacement !== "body-only";

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <nav className="text-sm text-[var(--muted)]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href={newsIndexPath()}
              className="font-medium text-[var(--leaf-dark)] underline-offset-2 hover:underline"
            >
              Farm Stand News
            </Link>
          </li>
          <li aria-hidden className="text-[var(--line)]">
            /
          </li>
          <li className="truncate text-[var(--ink)]">{article.title}</li>
        </ol>
      </nav>

      <header className="mt-8">
        <h1 className="post-title font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl sm:leading-tight">
          {article.title}
        </h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          <span className="sr-only">Published </span>
          <time dateTime={article.publishedAt}>
            {formatPublishedDate(article.publishedAt)}
          </time>
          {article.updatedAt && article.updatedAt !== article.publishedAt ? (
            <>
              {" · Updated "}
              <time dateTime={modified}>{formatPublishedDate(modified)}</time>
            </>
          ) : null}
          <span aria-hidden> · </span>
          <span>{article.author.name}</span>
        </p>
      </header>

      {showHero && article.image ? (
        <div className="relative mt-8 overflow-hidden rounded-[var(--radius-md)] bg-[var(--panel)]">
          <Image
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="prose-marketing mt-10 text-base leading-relaxed sm:text-lg">
        <Content />
      </div>

      {article.faqs?.length ? (
        <section
          className="mt-14 border-t border-[var(--line)] pt-10"
          aria-labelledby="news-faq-heading"
        >
          <h2
            id="news-faq-heading"
            className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6">
            {article.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-[var(--ink)]">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </article>
  );
}

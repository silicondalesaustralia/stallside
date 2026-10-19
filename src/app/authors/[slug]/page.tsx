import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import AuthorSocialLinks from "@/components/blog/AuthorSocialLinks";
import BlogArticleList from "@/components/blog/BlogArticleList";
import { SITE_URL } from "@/lib/legal";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";
import { authorProfileGraphSchema } from "@/lib/blog/author-schema";
import { getActiveAuthor } from "@/lib/blog/authors";
import { authorPath, authorsIndexPath, editorialPolicyPath } from "@/lib/blog/paths";
import { getLiveBlogArticlesByAuthor } from "@/lib/blog/queries";

/** The marketing header reads the session cookie, so these pages can't be statically cached. */
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getActiveAuthor(slug);
  if (!author) return { title: "Author" };
  const title = `${author.name}, ${author.jobTitle}`;
  return {
    title,
    description: author.shortBio,
    alternates: { canonical: authorPath(author.slug) },
    openGraph: {
      title,
      description: author.shortBio,
      url: `${SITE_URL}${authorPath(author.slug)}`,
      type: "profile",
      images: [author.avatarUrl ? { url: author.avatarUrl, alt: author.name } : DEFAULT_OG_IMAGE],
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getActiveAuthor(slug);
  if (!author) notFound();
  const articles = await getLiveBlogArticlesByAuthor(author.id);
  const paragraphs = (author.bio || author.shortBio).split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <MarketingPageShell>
      <JsonLd data={authorProfileGraphSchema(author, articles)} />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <nav className="text-sm text-[var(--muted)]" aria-label="Breadcrumb">
          <Link href={authorsIndexPath()} className="font-medium text-[var(--leaf-dark)] underline-offset-2 hover:underline">
            Authors
          </Link>
        </nav>
        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <AuthorAvatar name={author.name} imageUrl={author.avatarUrl} size={112} />
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
              {author.name}
            </h1>
            <p className="text-base text-[var(--muted)]">{author.jobTitle}, Vendl</p>
            <AuthorSocialLinks urls={author.sameAs} name={author.name} />
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-[var(--ink)] sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))}
        </div>

        {author.expertise.length ? (
          <section className="mt-8" aria-labelledby="author-expertise">
            <h2 id="author-expertise" className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Writes about
            </h2>
            <p className="mt-2 text-base text-[var(--ink)]">{author.expertise.join(" · ")}</p>
          </section>
        ) : null}

        <p className="mt-8 text-sm text-[var(--muted)]">
          Every article is fact-checked and reviewed before publishing.{" "}
          <Link href={editorialPolicyPath()} className="font-semibold text-[var(--leaf-dark)] underline">
            Read our editorial policy
          </Link>
        </p>

        <section className="mt-12 border-t border-[var(--line)] pt-10" aria-labelledby="author-articles">
          <h2 id="author-articles" className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Articles by {author.name}
          </h2>
          <BlogArticleList items={articles} emptyText="Articles are on the way." />
        </section>
      </main>
    </MarketingPageShell>
  );
}

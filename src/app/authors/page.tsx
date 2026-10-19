import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { APP_NAME } from "@/lib/constants";
import { getActiveAuthors } from "@/lib/blog/authors";
import { authorPath, authorsIndexPath, editorialPolicyPath } from "@/lib/blog/paths";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Authors";
const description = "The people who research, write and review Vendl's guides and news for home producers and small sellers.";

export const revalidate = 3600;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: authorsIndexPath() },
};

export default async function AuthorsPage() {
  const authors = await getActiveAuthors();

  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: authorsIndexPath(),
          name: `${title} · ${APP_NAME}`,
          description,
          type: "CollectionPage",
        })}
      />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Authors
        </h1>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          {description}{" "}
          <Link href={editorialPolicyPath()} className="font-semibold text-[var(--leaf-dark)] underline">
            How we work
          </Link>
        </p>
        <ul className="mt-10 flex flex-col gap-6">
          {authors.map((author) => (
            <li key={author.id} className="flex gap-4">
              <AuthorAvatar name={author.name} imageUrl={author.avatarUrl} size={64} />
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={authorPath(author.slug)}
                  className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)] underline-offset-2 hover:underline"
                >
                  {author.name}
                </Link>
                <p className="text-sm text-[var(--muted)]">{author.jobTitle}</p>
                <p className="text-base text-[var(--ink)]">{author.shortBio}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </MarketingPageShell>
  );
}

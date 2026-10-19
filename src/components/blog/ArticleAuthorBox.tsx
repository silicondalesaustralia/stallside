import Link from "next/link";
import type { NewsAuthor } from "@/lib/farms-stand-news/types";
import { editorialPolicyPath } from "@/lib/blog/paths";
import AuthorAvatar from "./AuthorAvatar";
import AuthorSocialLinks from "./AuthorSocialLinks";

/** "About the author" card at the end of an article. */
export default function ArticleAuthorBox({ author }: { author: NewsAuthor }) {
  if (author.kind === "organization" || !author.profilePath) return null;
  return (
    <aside
      className="mt-14 flex flex-col gap-4 rounded-[var(--radius-md)] bg-[var(--panel)] p-5 sm:flex-row sm:p-6"
      aria-labelledby="article-author-heading"
    >
      <AuthorAvatar name={author.name} imageUrl={author.imageUrl} size={72} />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">About the author</p>
        <h2 id="article-author-heading" className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
          <Link href={author.profilePath} className="underline-offset-2 hover:underline">
            {author.name}
          </Link>
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">{author.jobTitle}</span>
        </h2>
        <p className="text-base leading-relaxed text-[var(--ink)]">{author.bio}</p>
        <AuthorSocialLinks urls={author.sameAs ?? []} name={author.name} />
        <p className="text-sm text-[var(--muted)]">
          <Link href={author.profilePath} className="font-semibold text-[var(--leaf-dark)] underline">
            More from {author.name}
          </Link>
          {" · "}
          <Link href={editorialPolicyPath()} className="underline">
            How we research and review articles
          </Link>
        </p>
      </div>
    </aside>
  );
}

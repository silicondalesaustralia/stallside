import Link from "next/link";
import type { NewsAuthor } from "@/lib/farms-stand-news/types";

export default function ArticleBylineAuthor({ author }: { author: NewsAuthor }) {
  if (!author.profilePath) return <span>{author.name}</span>;
  return (
    <span>
      By{" "}
      <Link
        href={author.profilePath}
        rel="author"
        className="font-semibold text-[var(--leaf-dark)] underline-offset-2 hover:underline"
      >
        {author.name}
      </Link>
    </span>
  );
}

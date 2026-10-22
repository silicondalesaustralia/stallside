import Image from "next/image";
import Link from "next/link";
import type { BlogListItem } from "./BlogArticleList";
import { newsArticlePath } from "@/lib/farms-stand-news/paths";
import { DEFAULT_OG_IMAGE } from "@/lib/og-image";

function formatListDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function BlogArticleCard({ item }: { item: BlogListItem }) {
  const href = item.canonicalPath ?? newsArticlePath(item.slug);
  const image = item.image ?? { src: DEFAULT_OG_IMAGE.url, alt: DEFAULT_OG_IMAGE.alt };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-white ring-1 ring-[var(--line)]">
      <Link href={href} className="relative block aspect-[16/9] bg-[var(--panel)]" tabIndex={-1} aria-hidden>
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {item.publishedAt ? (
          <p className="text-xs text-[var(--muted)]">
            <time dateTime={item.publishedAt}>{formatListDate(item.publishedAt)}</time>
          </p>
        ) : null}
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold leading-snug text-[var(--field)]">
          <Link href={href} className="transition hover:text-[var(--leaf-dark)]">
            {item.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--ink)]">{item.excerpt}</p>
        <p className="mt-auto pt-4">
          <Link href={href} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
            Read more<span className="sr-only">: {item.title}</span>
          </Link>
        </p>
      </div>
    </article>
  );
}

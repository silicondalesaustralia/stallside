import Image from "next/image";
import Link from "next/link";
import type { RelatedArticle } from "@/lib/blog/related-articles";

export default function ArticleKeepReading({ items }: { items: RelatedArticle[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-14 border-t border-[var(--line)] pt-10" aria-labelledby="keep-reading-heading">
      <h2 id="keep-reading-heading" className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        Keep reading
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.href} className="overflow-hidden rounded-[var(--radius-md)] bg-white ring-1 ring-[var(--line)]">
            <Link href={item.href} className="group block h-full">
              {item.image ? (
                <div className="relative aspect-[16/9] bg-[var(--panel)]">
                  <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 640px) 100vw, 260px" className="object-cover" />
                </div>
              ) : null}
              <div className="p-4">
                <p className="font-[family-name:var(--font-display)] text-base font-bold leading-snug text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
                  {item.title}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{item.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

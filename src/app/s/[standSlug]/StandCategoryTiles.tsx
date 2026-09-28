import Image from "next/image";
import Link from "next/link";
import type { ShopCategory } from "@/lib/categories/public-categories";
import { standCategoryPath } from "@/lib/stand-seo";

export default function StandCategoryTiles({
  standSlug,
  categories,
}: {
  standSlug: string;
  categories: ShopCategory[];
}) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={standCategoryPath(standSlug, c.slug)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]"
          >
            <div className="relative aspect-[4/3] bg-[var(--wash)]">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 512px) 50vw, 256px"
                  className="object-cover transition group-hover:scale-[1.03]"
                />
              ) : null}
            </div>
            <div className="px-3 py-2.5">
              <p className="font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[var(--field)]">
                {c.title}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {c.productIds.length} item{c.productIds.length === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

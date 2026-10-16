"use client";

import Image from "next/image";
import Link from "next/link";
import { shopCategoryPath } from "@/lib/storefront/paths";
import HeroTitle from "./HeroTitle";
import HeroSubtitle from "./HeroSubtitle";
import type { HeroView } from "./types";

/** "Category tiles": shoppers pick where to go straight from the top of the page. */
export default function HeroMosaic({ view }: { view: HeroView }) {
  const { meta } = view;
  const centre = view.look.align === "centre";
  const tiles = meta.categories.slice(0, 4).map((c) => ({
    ...c,
    image: c.imageUrl || meta.products.find((p) => p.imageUrl && p.categoryIds.includes(c.id))?.imageUrl || null,
  }));
  const cols = tiles.length === 4 ? "sf-lg:grid-cols-4" : tiles.length === 3 ? "sf-lg:grid-cols-3" : "";
  return (
    <section className={`${view.sectionClass} border-b border-[var(--line)] bg-[var(--panel)]`} style={view.style}>
      <div className="mx-auto max-w-[var(--studio-content-max)] py-10 studio-gutter studio-gutter--wide sf-sm:py-14">
        <div className={centre ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
          <HeroTitle view={view} className="studio-display text-3xl text-[var(--field)] sf-sm:text-5xl" />
          <HeroSubtitle view={view} className="mt-3 text-lg text-[var(--muted)]" />
          {view.buttons ? (
            <div className={`mt-6 flex flex-wrap gap-3 ${centre ? "justify-center" : ""}`}>{view.buttons}</div>
          ) : null}
        </div>
        <ul className={`mt-8 grid grid-cols-2 gap-3 sf-sm:gap-4 ${cols}`}>
          {tiles.map((c) => (
            <li key={c.id}>
              <Link
                href={shopCategoryPath(meta.storefrontSlug, c.slug, meta.draft, meta.basePath)}
                className="group studio-section-image relative block aspect-[4/5] overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)]"
              >
                {c.image ? (
                  <Image src={c.image} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(max-width:1024px) 50vw, 25vw" />
                ) : null}
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-lg font-semibold text-white sf-sm:text-xl">{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

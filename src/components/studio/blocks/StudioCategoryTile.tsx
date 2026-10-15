import Link from "next/link";
import type { CategoryLook } from "@/lib/studio/preset-registry";
import type { CategoryTileData, CategoryTileOptions } from "@/lib/studio/category-looks";
import CategoryPhoto from "./CategoryPhoto";
import CategoryTileText from "./CategoryTileText";

const CARD = "group block overflow-hidden rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white";
const ON_PHOTO = "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent";

/** One category link, drawn in the section's chosen look. */
export default function StudioCategoryTile({
  cat,
  href,
  look,
  options,
}: {
  cat: CategoryTileData;
  href: string;
  look: CategoryLook;
  options: CategoryTileOptions;
}) {
  if (look === "compact") {
    return (
      <Link
        href={href}
        className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf-dark)]"
      >
        <CategoryTileText cat={cat} options={{ ...options, showDescriptions: false, showRatings: false }} nameClass="" />
      </Link>
    );
  }

  if (look === "minimal") {
    return (
      <Link href={href} className="group inline-flex text-lg text-[var(--field)] underline-offset-4 hover:underline">
        <CategoryTileText cat={cat} options={{ ...options, showDescriptions: false, showRatings: false }} nameClass="font-semibold" />
      </Link>
    );
  }

  if (look === "circles") {
    return (
      <Link href={href} className="group flex flex-col items-center text-center">
        <CategoryPhoto imageUrl={cat.imageUrl} title={cat.title} className="aspect-square w-full rounded-full" sizes="20vw" />
        <CategoryTileText
          cat={cat}
          options={{ ...options, showDescriptions: false }}
          className="mt-2 flex flex-col items-center"
        />
      </Link>
    );
  }

  if (look === "list") {
    return (
      <Link href={href} className={`${CARD} flex items-center gap-4 p-3`}>
        <CategoryPhoto imageUrl={cat.imageUrl} title={cat.title} className="size-20 shrink-0 rounded-[var(--studio-card-radius)]" sizes="80px" />
        <CategoryTileText cat={cat} options={options} className="min-w-0 flex-1" />
        <span aria-hidden className="pr-1 text-xl text-[var(--muted)] group-hover:text-[var(--leaf-dark)]">→</span>
      </Link>
    );
  }

  if (look === "overlay" || look === "banner") {
    const box = look === "banner" ? "aspect-[2/1] sf-sm:aspect-[4/1]" : "aspect-[4/5]";
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-[var(--studio-card-radius)]">
        <CategoryPhoto imageUrl={cat.imageUrl} title={cat.title} className={box} sizes={look === "banner" ? "100vw" : "33vw"} />
        <div className={ON_PHOTO} />
        <CategoryTileText
          cat={cat}
          options={options}
          onDark
          className={`absolute inset-x-0 bottom-0 p-4 ${look === "banner" ? "sf-sm:p-6" : ""}`}
          nameClass={`font-bold text-white ${look === "banner" ? "text-2xl" : "text-lg"}`}
        />
      </Link>
    );
  }

  if (look === "cards") {
    return (
      <Link href={href} className={`${CARD} h-full`}>
        <CategoryPhoto imageUrl={cat.imageUrl} title={cat.title} className="aspect-[4/3]" />
        <CategoryTileText cat={cat} options={options} className="p-4" />
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      <CategoryPhoto imageUrl={cat.imageUrl} title={cat.title} className="aspect-[4/3] rounded-[var(--studio-card-radius)]" />
      <CategoryTileText cat={cat} options={options} className="pt-3" />
    </Link>
  );
}

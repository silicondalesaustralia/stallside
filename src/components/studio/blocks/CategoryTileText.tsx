import SectionElement from "@/components/studio/SectionElement";
import CategoryRating from "./CategoryRating";
import type { CategoryTileData, CategoryTileOptions } from "@/lib/studio/category-looks";

/** A category's name, then its description and star rating when the seller turned them on. */
export default function CategoryTileText({
  cat,
  options,
  className = "",
  nameClass = "font-semibold text-[var(--field)] group-hover:text-[var(--leaf-dark)]",
  onDark = false,
}: {
  cat: CategoryTileData;
  options: CategoryTileOptions;
  className?: string;
  nameClass?: string;
  onDark?: boolean;
}) {
  const muted = onDark ? "text-white/85" : "text-[var(--muted)]";
  return (
    <div className={className}>
      <SectionElement el="categoryName" className={nameClass}>
        {cat.title}
      </SectionElement>
      {options.showDescriptions && cat.description ? (
        <SectionElement el="categoryDescription" className={`mt-1 line-clamp-3 text-sm ${muted}`}>
          {cat.description}
        </SectionElement>
      ) : null}
      {options.showRatings ? (
        <CategoryRating rating={cat.rating} isEditing={options.isEditing} onDark={onDark} className="mt-1.5" />
      ) : null}
    </div>
  );
}

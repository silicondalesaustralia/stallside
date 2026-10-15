import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { shopCategoryPath } from "@/lib/storefront/paths";
import {
  categoryGridClassFor,
  categoryLookOf,
  categoryLookIsSlim,
  type CategoryCardBackground,
} from "@/lib/studio/category-looks";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionElement from "@/components/studio/SectionElement";
import StudioCategoryTile from "./StudioCategoryTile";

const INTRO = "mt-3 max-w-2xl text-lg leading-relaxed text-[var(--muted)]";

export default function StudioCategoriesBlock({
  source,
  categoryIds,
  preset,
  heading,
  intro = "",
  showDescriptions = false,
  showRatings = false,
  cardBackground = "white",
  metadata,
  isEditing,
  editable = false,
}: {
  source: "all" | "selected";
  categoryIds: string[];
  preset: string | undefined;
  heading: string;
  intro?: string;
  showDescriptions?: boolean;
  showRatings?: boolean;
  cardBackground?: CategoryCardBackground;
  metadata: PuckSpikeMetadata;
  isEditing?: boolean;
  editable?: boolean;
}) {
  let categories = metadata.categories;
  if (source === "selected" && categoryIds.length > 0) {
    categories = categories.filter((c) => categoryIds.includes(c.id));
  }
  const look = categoryLookOf(preset);

  const top = (
    <>
      <StudioSectionHeading
        editable={editable}
        value={heading}
        fallback="Browse categories"
        placeholder="Categories heading"
      />
      {editable ? (
        <SectionElement el="intro" as="div">
          <InlineEditableText prop="intro" value={intro} className={INTRO} multiline placeholder="Add a description (optional)" />
        </SectionElement>
      ) : intro.trim() ? (
        <SectionElement el="intro" className={`${INTRO} whitespace-pre-line`}>
          {intro}
        </SectionElement>
      ) : null}
    </>
  );

  if (categories.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          {top}
          <p className="mt-3 text-sm text-[var(--muted)]">Add categories to show them here.</p>
        </div>
      </section>
    );
  }

  const options = {
    showDescriptions: showDescriptions && !categoryLookIsSlim(look),
    showRatings,
    isEditing,
    cardBackground,
  };

  return (
    <section className="studio-section">
      <div className="studio-section__inner">
        {top}
        <ul className={`mt-8 ${categoryGridClassFor(look)}`}>
          {categories.map((cat) => (
            <li key={cat.id} data-edit-category={isEditing ? cat.id : undefined}>
              <StudioCategoryTile
                cat={cat}
                href={shopCategoryPath(metadata.storefrontSlug, cat.slug, metadata.draft, metadata.basePath)}
                look={look}
                options={options}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

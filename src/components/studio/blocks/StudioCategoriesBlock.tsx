import Image from "next/image";
import Link from "next/link";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { shopCategoryPath } from "@/lib/storefront/paths";
import type { CategoryPreset } from "@/lib/studio/preset-registry";
import { mapCategoryPreset } from "@/lib/studio/preset-registry";

export default function StudioCategoriesBlock({
  source,
  categoryIds,
  preset,
  heading,
  metadata,
  isEditing,
}: {
  source: "all" | "selected";
  categoryIds: string[];
  preset: CategoryPreset;
  heading: string;
  metadata: PuckSpikeMetadata;
  isEditing?: boolean;
}) {
  let categories = metadata.categories;
  if (source === "selected" && categoryIds.length > 0) {
    categories = categories.filter((c) => categoryIds.includes(c.id));
  }

  if (categories.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner">
          <h2 className="studio-heading">{heading}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">Add categories to show them here.</p>
        </div>
      </section>
    );
  }

  const mappedPreset = mapCategoryPreset(
    "templateId" in metadata ? (metadata as import("@/lib/studio/types").StudioMetadata).templateId : "artisan",
    preset,
  );

  const gridClass =
    mappedPreset === "compact" || mappedPreset === "minimal"
      ? "flex flex-wrap gap-2"
      : mappedPreset === "cards"
        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        : "grid grid-cols-2 gap-4 sm:grid-cols-3";

  return (
    <section className="studio-section">
      <div className="studio-section__inner">
        <h2 className="studio-heading">{heading}</h2>
        <ul className={`mt-8 ${gridClass}`}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <CategoryTile cat={cat} preset={mappedPreset} metadata={metadata} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoryTile({
  cat,
  preset,
  metadata,
}: {
  cat: PuckSpikeMetadata["categories"][number];
  preset: "tiles" | "cards" | "compact" | "minimal";
  metadata: PuckSpikeMetadata;
}) {
  const href = shopCategoryPath(
    metadata.storefrontSlug,
    cat.slug,
    metadata.draft,
    metadata.basePath,
  );
  const imageUrl = cat.imageUrl;

  if (preset === "compact" || preset === "minimal") {
    return (
      <Link
        href={href}
        className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf-dark)]"
      >
        {cat.title}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white"
    >
      <div className="relative aspect-[4/3] bg-[var(--wash)]">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="33vw" />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="text-sm font-medium text-[var(--muted)]">{cat.title}</span>
          </div>
        )}
      </div>
      {imageUrl ? (
        <p className="p-3 font-semibold text-[var(--field)] group-hover:text-[var(--leaf-dark)]">
          {cat.title}
        </p>
      ) : null}
    </Link>
  );
}

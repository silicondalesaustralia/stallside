import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopMenuPath } from "@/lib/storefront/paths";
import type { NextDropPreset } from "@/lib/studio/preset-registry";

type Props = {
  maxItems: number;
  preset: NextDropPreset;
  heading: string;
  showClosingDate: boolean;
  showPickupDate: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
};

export default function StudioNextDropBlock({
  maxItems,
  preset,
  heading,
  showClosingDate,
  showPickupDate,
  metadata: meta,
  isEditing,
}: Props) {
  const menus = meta.menus.slice(0, Math.max(1, Math.min(maxItems, 6)));

  if (menus.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section studio-section--wash">
        <div className="studio-section__inner">
          <h2 className="studio-heading">{heading || "Next bake"}</h2>
          <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-white/60 p-6 text-sm text-[var(--muted)]">
            No upcoming menu yet. Create a menu to use this section.
          </p>
        </div>
      </section>
    );
  }

  const featured = preset === "featured" && menus[0];

  return (
    <section className="studio-section studio-section--wash">
      <div className="studio-section__inner">
        <h2 className="studio-heading">{heading || "Next bake"}</h2>
        {featured ? (
          <FeaturedMenuCard
            menu={featured}
            meta={meta}
            showClosingDate={showClosingDate}
            showPickupDate={showPickupDate}
          />
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {menus.map((menu) => (
              <li key={menu.slug}>
                <MenuCard
                  menu={menu}
                  meta={meta}
                  preset={preset}
                  showClosingDate={showClosingDate}
                  showPickupDate={showPickupDate}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function FeaturedMenuCard({
  menu,
  meta,
  showClosingDate,
  showPickupDate,
}: {
  menu: StudioMetadata["menus"][number];
  meta: StudioMetadata;
  showClosingDate: boolean;
  showPickupDate: boolean;
}) {
  return (
    <Link
      href={shopMenuPath(meta.storefrontSlug, menu.slug, meta.draft, meta.basePath)}
      className="mt-8 block overflow-hidden rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-6 sm:p-8"
    >
      <p className="studio-eyebrow text-[var(--leaf-dark)]">Order window open</p>
      <h3 className="studio-heading mt-2 text-2xl sm:text-3xl">{menu.title}</h3>
      {menu.description ? (
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{menu.description}</p>
      ) : null}
      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {showClosingDate && menu.orderByLabel ? (
          <div>
            <dt className="font-semibold text-[var(--field)]">Orders close</dt>
            <dd className="text-[var(--muted)]">{menu.orderByLabel}</dd>
          </div>
        ) : null}
        {showPickupDate && menu.collectionLabel ? (
          <div>
            <dt className="font-semibold text-[var(--field)]">Pick up</dt>
            <dd className="text-[var(--muted)]">{menu.collectionLabel}</dd>
          </div>
        ) : null}
      </dl>
      <span className="studio-btn studio-btn--primary mt-6 inline-flex">View menu</span>
    </Link>
  );
}

function MenuCard({
  menu,
  meta,
  preset,
  showClosingDate,
  showPickupDate,
}: {
  menu: StudioMetadata["menus"][number];
  meta: StudioMetadata;
  preset: NextDropPreset;
  showClosingDate: boolean;
  showPickupDate: boolean;
}) {
  const compact = preset === "timeline";
  return (
    <Link
      href={shopMenuPath(meta.storefrontSlug, menu.slug, meta.draft, meta.basePath)}
      className={`block ${compact ? "border-l-2 border-[var(--leaf-dark)] pl-4 py-2" : "rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5"}`}
    >
      <h3 className="font-semibold text-[var(--field)]">{menu.title}</h3>
      {menu.description && !compact ? (
        <p className="mt-2 text-sm text-[var(--muted)]">{menu.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-[var(--leaf-dark)]">
        {showClosingDate && menu.orderByLabel ? `Orders close ${menu.orderByLabel}` : null}
        {showClosingDate && menu.orderByLabel && showPickupDate && menu.collectionLabel ? " · " : null}
        {showPickupDate && menu.collectionLabel ? `Pick up ${menu.collectionLabel}` : null}
      </p>
    </Link>
  );
}

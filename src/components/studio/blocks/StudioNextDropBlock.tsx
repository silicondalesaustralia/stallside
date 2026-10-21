import type { StudioMetadata } from "@/lib/studio/types";
import type { NextDropPreset } from "@/lib/studio/preset-registry";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import NextDropFeaturedCard from "./NextDropFeaturedCard";
import NextDropMenuCard from "./NextDropMenuCard";

type Props = {
  maxItems: number;
  preset: NextDropPreset;
  heading: string;
  showClosingDate: boolean;
  showPickupDate: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioNextDropBlock({
  maxItems,
  preset,
  heading,
  showClosingDate,
  showPickupDate,
  metadata: meta,
  isEditing,
  editable = false,
}: Props) {
  const menus = meta.menus.slice(0, Math.max(1, Math.min(maxItems, 6)));
  const title = (
    <StudioSectionHeading
      editable={editable}
      value={heading}
      fallback="Next bake"
      placeholder="Next drop heading"
    />
  );

  if (menus.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section studio-section--wash">
        <div className="studio-section__inner">
          {title}
          <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-white/60 p-6 text-sm text-[var(--muted)]">
            No upcoming menu or open pre-order yet. Create a menu or a pre-order page to use this section.
          </p>
        </div>
      </section>
    );
  }

  const featured = preset === "featured" && menus[0];

  return (
    <section className="studio-section studio-section--wash">
      <div className="studio-section__inner">
        {title}
        {featured ? (
          <NextDropFeaturedCard
            menu={featured}
            meta={meta}
            showClosingDate={showClosingDate}
            showPickupDate={showPickupDate}
          />
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {menus.map((menu) => (
              <li key={menu.slug}>
                <NextDropMenuCard
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

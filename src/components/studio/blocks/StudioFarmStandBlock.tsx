import SectionButtonLink from "@/components/studio/SectionButtonLink";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import SectionCopy from "@/components/studio/SectionCopy";

const LABEL = "text-xs font-bold uppercase tracking-wide text-[var(--muted)]";

type Props = {
  heading: string;
  showHours: boolean;
  showLocation: boolean;
  showDirections: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioFarmStandBlock({
  heading,
  showHours,
  showLocation,
  showDirections,
  metadata: meta,
  editable = false,
}: Props) {
  const region = meta.branding.regionLabel;
  const fulfilment = meta.fulfilmentOptions.filter((o) => o.kind === "PICKUP" || o.kind === "LOCAL_DELIVERY");
  const shopHref = shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath);

  return (
    <section className="studio-section studio-section--wash studio-farm-stand">
      <div className="studio-section__inner">
        <StudioSectionHeading
          editable={editable}
          value={heading}
          fallback="Visit the stand"
          placeholder="Farm stand heading"
        />
        <div className="mt-8 grid gap-6 sf-lg:grid-cols-3">
          {showLocation ? (
            <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
              <SectionCopy k="locationLabel" fallback="Location" as="p" className={LABEL} />
              <SectionCopy
                k="location"
                fallback={region ?? meta.branding.businessName}
                as="p"
                multiline
                className="mt-2 whitespace-pre-line font-semibold text-[var(--field)]"
              />
              {showDirections && region ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(region)}`}
                  className="mt-3 inline-block text-sm font-semibold text-[var(--site-accent,var(--leaf-dark))] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SectionCopy k="directions" fallback="Get directions" />
                </a>
              ) : null}
            </div>
          ) : null}
          {showHours ? (
            <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
              <SectionCopy k="hoursLabel" fallback="Stand hours" as="p" className={LABEL} />
              <SectionCopy
                k="hours"
                fallback={fulfilment[0]?.label ?? "Open for pickup — check shop for current availability"}
                as="p"
                multiline
                className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--field)]"
              />
            </div>
          ) : null}
          <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
            <SectionCopy k="availableLabel" fallback="What's available" as="p" className={LABEL} />
            <SectionCopy
              k="available"
              fallback="{count} products listed this week"
              vars={{ count: meta.products.length }}
              as="p"
              multiline
              className="mt-2 whitespace-pre-line text-sm text-[var(--muted)]"
            />
            <SectionButtonLink meta={meta} defaultHref={shopHref} className="studio-btn studio-btn--primary mt-4 text-sm">
              <SectionCopy k="browse" fallback="Browse produce" />
            </SectionButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

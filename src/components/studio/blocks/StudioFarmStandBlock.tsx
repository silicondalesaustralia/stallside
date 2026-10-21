import SectionButtonLink from "@/components/studio/SectionButtonLink";
import SectionElement from "@/components/studio/SectionElement";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import SectionCopy from "@/components/studio/SectionCopy";

const CARD = "studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]";
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
            <div className={CARD}>
              <SectionElement el="cardLabel" className={LABEL}>
                <SectionCopy k="locationLabel" fallback="Location" />
              </SectionElement>
              <SectionElement el="cardText" className="mt-2 whitespace-pre-line font-semibold text-[var(--field)]">
                <SectionCopy k="location" fallback={region ?? meta.branding.businessName} multiline />
              </SectionElement>
              {showDirections && region ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(region)}`}
                  className="mt-3 inline-block text-sm font-semibold text-[var(--site-accent,var(--leaf-dark))] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SectionElement el="cardLink" as="span">
                    <SectionCopy k="directions" fallback="Get directions" />
                  </SectionElement>
                </a>
              ) : null}
            </div>
          ) : null}
          {showHours ? (
            <div className={CARD}>
              <SectionElement el="cardLabel" className={LABEL}>
                <SectionCopy k="hoursLabel" fallback="Stand hours" />
              </SectionElement>
              <SectionElement el="cardText" className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--field)]">
                <SectionCopy
                  k="hours"
                  fallback={fulfilment[0]?.label ?? "Open for pickup — check shop for current availability"}
                  multiline
                />
              </SectionElement>
            </div>
          ) : null}
          <div className={CARD}>
            <SectionElement el="cardLabel" className={LABEL}>
              <SectionCopy k="availableLabel" fallback="What's available" />
            </SectionElement>
            <SectionElement el="cardText" className="mt-2 whitespace-pre-line text-sm text-[var(--muted)]">
              <SectionCopy
                k="available"
                fallback="{count} products listed this week"
                vars={{ count: meta.products.length }}
                multiline
              />
            </SectionElement>
            <SectionButtonLink meta={meta} defaultHref={shopHref} className="studio-btn studio-btn--primary mt-4 text-sm">
              <SectionCopy k="browse" fallback="Browse produce" />
            </SectionButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

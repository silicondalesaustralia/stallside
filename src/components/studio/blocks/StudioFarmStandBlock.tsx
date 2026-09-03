import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopPagePath } from "@/lib/storefront/paths";

type Props = {
  heading: string;
  showHours: boolean;
  showLocation: boolean;
  showDirections: boolean;
  metadata: StudioMetadata;
  isEditing?: boolean;
};

export default function StudioFarmStandBlock({
  heading,
  showHours,
  showLocation,
  showDirections,
  metadata: meta,
}: Props) {
  const region = meta.branding.regionLabel;
  const fulfilment = meta.fulfilmentOptions.filter((o) => o.kind === "PICKUP" || o.kind === "LOCAL_DELIVERY");
  const shopHref = shopPagePath(meta.storefrontSlug, "shop", meta.draft, meta.basePath);

  return (
    <section className="studio-section studio-section--wash studio-farm-stand">
      <div className="studio-section__inner">
        <h2 className="studio-heading">{heading || "Visit the stand"}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {showLocation ? (
            <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Location</p>
              <p className="mt-2 font-semibold text-[var(--field)]">
                {region ?? meta.branding.businessName}
              </p>
              {showDirections && region ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(region)}`}
                  className="mt-3 inline-block text-sm font-semibold text-[var(--site-accent,var(--leaf-dark))] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                </a>
              ) : null}
            </div>
          ) : null}
          {showHours ? (
            <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Stand hours</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--field)]">
                {fulfilment[0]?.label ?? "Open for pickup — check shop for current availability"}
              </p>
            </div>
          ) : null}
          <div className="studio-farm-stand__card rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">What&apos;s available</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {meta.products.length} products listed this week
            </p>
            <Link href={shopHref} className="studio-btn studio-btn--primary mt-4 text-sm">
              Browse produce
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

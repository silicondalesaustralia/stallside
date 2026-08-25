import Link from "next/link";
import { Prose, SectionH2 } from "@/components/jurisdictions/section-chrome";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import {
  getJurisdictionBySlug,
  isPageIndexable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
  loadAllUsJurisdictionRecords,
  neighboursFor,
} from "@/lib/jurisdictions";

const AU_ANCHORS = [
  "rules for selling food from home in",
  "home-based food business rules in",
  "how to notify in",
  "council food notification in",
];

const US_ANCHORS = [
  "cottage food law in",
  "home kitchen food sales rules in",
  "cottage food labelling in",
  "approved cottage foods in",
];

export default function NearbyJurisdictions({
  record,
}: {
  record: JurisdictionRecord;
}) {
  const neighbourSlugs = neighboursFor(record);
  const pool =
    record.country === "US"
      ? loadAllUsJurisdictionRecords()
      : loadAllAuJurisdictionRecords();
  const available = new Set(pool.filter(isPageIndexable).map((r) => r.slug));
  const anchors = record.country === "US" ? US_ANCHORS : AU_ANCHORS;

  const links = neighbourSlugs
    .map((slug, i) => {
      const neighbour = getJurisdictionBySlug(slug);
      if (!neighbour || !available.has(slug)) return null;
      if (neighbour.country !== record.country) return null;
      return {
        record: neighbour,
        anchor: `${anchors[i % anchors.length]} ${neighbour.name}`,
      };
    })
    .filter(
      (x): x is { record: JurisdictionRecord; anchor: string } => x != null,
    );

  if (links.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionH2>Nearby jurisdictions</SectionH2>
      <Prose>
        {record.country === "AU"
          ? "Food-business rules change when you cross a state or territory border."
          : "Cottage food rules change when you cross a state border."}{" "}
        If you are comparing requirements or selling across borders, see the equivalent
        guides for{" "}
        {links.map((link, i) => (
          <span key={link.record.slug}>
            {i > 0 ? (i === links.length - 1 ? " and " : ", ") : null}
            <Link
              href={jurisdictionPathFor(link.record)}
              className="underline underline-offset-2"
            >
              {link.record.name}
            </Link>
          </span>
        ))}
        .
      </Prose>
    </section>
  );
}

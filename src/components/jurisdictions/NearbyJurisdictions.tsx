import Link from "next/link";
import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import {
  councilsPath,
  getJurisdictionBySlug,
  isPageRenderable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
  loadAllUsJurisdictionRecords,
  neighboursFor,
} from "@/lib/jurisdictions";
import { Prose, SectionH2 } from "@/components/jurisdictions/section-chrome";

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
  const available = new Set(pool.filter(isPageRenderable).map((r) => r.slug));
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

  if (links.length === 0 && record.country !== "AU") return null;

  return (
    <section className="mt-12">
      <SectionH2>Nearby jurisdictions</SectionH2>
      <Prose>
        {record.country === "AU"
          ? "Food-business rules change when you cross a state or territory border."
          : "Cottage food rules change when you cross a state border."}
        {links.length > 0 ? (
          <>
            {" "}
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
          </>
        ) : null}
      </Prose>
      {record.country === "AU" && record.contact.council_directory_url ? (
        <p className="mt-4 text-[var(--field)] leading-relaxed">
          Looking for the right council? See the{" "}
          <Link
            href={councilsPath(record.slug)}
            className="underline underline-offset-2"
          >
            {record.name} council directory
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}

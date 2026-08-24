import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import { SectionH2 } from "@/components/jurisdictions/section-chrome";

export default function QuirkSection({ record }: { record: JurisdictionRecord }) {
  if (!record.unique.quirk_paragraph.trim()) return null;

  const title =
    record.country === "US"
      ? `The ${record.name} catch`
      : `The ${record.demonym || record.name} catch`;

  return (
    <section className="mt-12">
      <SectionH2>{title}</SectionH2>
      <p className="mt-4 whitespace-pre-line text-[var(--field)] leading-relaxed">
        {record.unique.quirk_paragraph}
      </p>
      {record.unique.common_mistake ? (
        <p className="mt-4 text-[var(--field)] leading-relaxed">
          <strong className="font-semibold">Common mistake:</strong>{" "}
          {record.unique.common_mistake}
        </p>
      ) : null}
    </section>
  );
}

import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import { Prose, ProseFollow, SectionH2 } from "@/components/jurisdictions/section-chrome";

export default function SourcesSection({ record }: { record: JurisdictionRecord }) {
  return (
    <section className="mt-12 border-t border-[var(--line)] pt-10">
      <SectionH2>Sources and verification</SectionH2>
      <Prose>
        This page was checked against primary government and regulator material on{" "}
        {record.meta.last_verified}.
      </Prose>
      <p className="mt-4 text-sm font-semibold text-[var(--field)]">Primary sources used:</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--field)] leading-relaxed">
        {record.sources.map((s) => (
          <li key={`${s.field}-${s.url}`}>
            <span className="text-[var(--muted)]">{s.field}: </span>
            <a
              href={s.url}
              className="underline underline-offset-2 break-all"
              rel="noopener noreferrer"
              target="_blank"
            >
              {s.url}
            </a>
            <span className="text-[var(--muted)]"> (retrieved {s.retrieved})</span>
          </li>
        ))}
        {record.contact.url ? (
          <li>
            <span className="text-[var(--muted)]">Regulator page: </span>
            <a
              href={record.contact.url}
              className="underline underline-offset-2 break-all"
              rel="noopener noreferrer"
              target="_blank"
            >
              {record.contact.url}
            </a>
          </li>
        ) : null}
      </ul>
      <ProseFollow>
        Rules change. Confirm the current requirements with{" "}
        {record.gate.regulator_primary}
        {record.gate.regulator_fallback ? `, ${record.gate.regulator_fallback}` : ""} or
        the relevant regulator before you start. This page is a practical reference, not
        legal advice, and does not replace the {record.law.statute}
        {record.country === "AU" ? ", the Food Standards Code" : ""} or directions from an
        authorised regulator.
      </ProseFollow>
      <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
        Last verified: {record.meta.last_verified}
        {" · "}
        Next review: {record.meta.next_review_due}
      </p>
    </section>
  );
}

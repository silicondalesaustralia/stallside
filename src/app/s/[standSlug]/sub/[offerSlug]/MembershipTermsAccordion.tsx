import { parseTermsSections } from "@/lib/membership-terms";

export default function MembershipTermsAccordion({ text }: { text: string }) {
  const sections = parseTermsSections(text);
  if (sections.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[19px] font-semibold text-[var(--m-ink)]">
        The details, made simple
      </h2>
      <div className="divide-y divide-[var(--m-divider)] border-y border-[var(--m-divider)]">
        {sections.map((section, i) => (
          <details
            key={`${section.heading}-${i}`}
            className="group py-3"
          >
            <summary className="cursor-pointer list-none text-[15px] font-semibold text-[var(--m-ink)] marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-button)] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {section.heading}
                <span
                  className="text-[var(--m-muted)] transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            {section.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--m-muted)]">
                {section.body}
              </p>
            ) : null}
          </details>
        ))}
      </div>
    </section>
  );
}

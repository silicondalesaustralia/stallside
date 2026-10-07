export default function PreOrderPageSupport({
  aboutHeading,
  aboutBody,
  collectionHeading,
  collectionBody,
}: {
  aboutHeading: string;
  aboutBody: string | null;
  collectionHeading: string;
  collectionBody: string | null;
}) {
  const sections = [
    aboutBody
      ? { heading: aboutHeading, body: aboutBody }
      : null,
    collectionBody
      ? { heading: collectionHeading, body: collectionBody }
      : null,
  ].filter((s): s is { heading: string; body: string } => Boolean(s));

  if (sections.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {sections.map((section) => (
          <details key={section.heading} className="group py-3">
            <summary className="cursor-pointer list-none text-[15px] font-semibold marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-focus)] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {section.heading}
                <span
                  className="text-[var(--muted)] transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
              {section.body}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

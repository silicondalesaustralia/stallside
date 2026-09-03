export default function StudioTextBlock({
  heading,
  body,
  alignment,
}: {
  heading: string;
  body: string;
  alignment: "left" | "centre";
}) {
  const align = alignment === "centre" ? "text-center mx-auto" : "text-left";
  return (
    <section className="studio-section mx-auto max-w-3xl px-4 py-[var(--studio-section-py,3rem)] sm:px-6">
      {heading ? (
        <h2
          className={`font-[family-name:var(--font-display)] text-2xl font-bold tracking-[var(--studio-heading-tracking)] text-[var(--field)] ${align}`}
        >
          {heading}
        </h2>
      ) : null}
      {body ? (
        <p className={`mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)] ${align}`}>
          {body}
        </p>
      ) : null}
    </section>
  );
}

type TextProps = {
  heading: string;
  body: string;
  alignment: "left" | "centre";
};

export default function PuckTextBlock({
  heading,
  body,
  alignment,
}: TextProps) {
  const align = alignment === "centre" ? "text-center" : "text-left";
  return (
    <section className={`mx-auto max-w-3xl px-4 py-12 sm:px-6 ${align}`}>
      {heading ? (
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          {heading}
        </h2>
      ) : null}
      {body ? (
        <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]">
          {body}
        </p>
      ) : null}
    </section>
  );
}

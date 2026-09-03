type AboutProps = {
  heading: string;
  body: string;
  layout: "simple" | "card";
};

export default function PuckAboutBlock({ heading, body, layout }: AboutProps) {
  const inner = (
    <>
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        {heading || "About us"}
      </h2>
      {body ? (
        <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]">
          {body}
        </p>
      ) : null}
    </>
  );

  if (layout === "card") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
          {inner}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">{inner}</section>
  );
}

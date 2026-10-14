/** A titled block of page rows in the Pages list. */
export default function PageGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        {title}
      </h2>
      {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
      <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {children}
      </ul>
    </section>
  );
}

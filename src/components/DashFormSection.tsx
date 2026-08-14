export default function DashFormSection({
  title,
  hint,
  children,
  span,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <section className={`dash-card p-5 ${span ? "lg:col-span-2" : ""}`}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {title}
      </h2>
      {hint ? (
        <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

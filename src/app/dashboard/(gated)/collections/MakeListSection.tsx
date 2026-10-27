/** What to make (and where deliveries go) for one pre-order page or cycle. */
export default function MakeListSection({
  skus,
  suburbs,
}: {
  skus: { name: string; qty: number }[];
  suburbs: { name: string; count: number }[];
}) {
  return (
    <section className="dash-card px-4 py-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Make list</h2>
      {skus.length === 0 ? (
        <p className="mt-1 text-sm text-[var(--muted)]">No items</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {skus.map((s) => (
            <li key={s.name} className="rounded-full bg-[var(--wash)] px-3 py-1">
              <span className="font-semibold tabular-nums">{s.qty}×</span> {s.name}
            </li>
          ))}
        </ul>
      )}
      {suburbs.length > 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Deliveries: {suburbs.map((s) => `${s.count} in ${s.name}`).join(", ")}
        </p>
      ) : null}
    </section>
  );
}

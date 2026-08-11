export default function MakeListSection({
  label,
  orderCount,
  takenLabel,
  windowClosed,
  skus,
  suburbs,
}: {
  label: string;
  orderCount: number;
  takenLabel: string;
  windowClosed: boolean;
  skus: { name: string; qty: number }[];
  suburbs: { name: string; count: number }[];
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="text-xl font-semibold">{label} - make</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {skus.map((s) => `${s.name} ${s.qty}`).join(" · ") || "No items"}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {orderCount} order{orderCount === 1 ? "" : "s"} · {takenLabel} taken
        {windowClosed ? " · window closed" : ""}
      </p>
      {suburbs.length > 0 ? (
        <p className="mt-2 text-sm">
          Deliver -{" "}
          {suburbs.map((s) => `${s.count} in ${s.name}`).join(", ")}
        </p>
      ) : null}
    </section>
  );
}

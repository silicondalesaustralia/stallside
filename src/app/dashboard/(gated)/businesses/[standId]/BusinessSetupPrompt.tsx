import Link from "next/link";

export default function BusinessSetupPrompt({
  standId,
  productCount,
  isNew,
}: {
  standId: string;
  productCount: number;
  isNew: boolean;
}) {
  if (productCount > 0) return null;

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--marigold)]/50 bg-[var(--marigold)]/15 p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--leaf-dark)]">
        {isNew ? "Business created" : "Your next move"}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)]">
        Add what you sell
      </h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Farm-stand items, baked goods, pre-order lines, or subscription boxes.
        You can fine-tune business details anytime.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/products/new?standId=${standId}`}
          className="inline-flex rounded-full bg-[var(--leaf)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
        >
          Add product
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--wash)]"
        >
          Back to overview
        </Link>
      </div>
    </section>
  );
}

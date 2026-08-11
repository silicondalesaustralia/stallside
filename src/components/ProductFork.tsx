import Link from "next/link";

export default function ProductFork() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/stall"
          className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-6 transition hover:border-[var(--leaf)]"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
            Unattended stall
          </h2>
          <p className="text-[var(--muted)]">
            Leave your goods out. People scan, pay, take.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Cash, card, and local payment methods. Instant sale alerts.
          </p>
          <span className="mt-auto text-sm font-semibold text-[var(--leaf-dark)]">
            See how stalls work →
          </span>
        </Link>
        <Link
          href="/pre-orders"
          className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-6 transition hover:border-[var(--leaf)]"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
            Pre-orders
          </h2>
          <p className="text-[var(--muted)]">
            Take orders ahead of a bake day, collection day or delivery.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Deposits, order windows, one make list.
          </p>
          <span className="mt-auto text-sm font-semibold text-[var(--leaf-dark)]">
            See how pre-orders work →
          </span>
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { ReadinessItem } from "@/lib/website/readiness";

export default function WebsiteReadinessChecklist({
  items,
  readyToPublish,
}: {
  items: ReadinessItem[];
  readyToPublish: boolean;
}) {
  const doneCount = items.filter((i) => i.done).length;
  return (
    <section
      aria-labelledby="website-readiness"
      className="mx-auto mb-6 max-w-5xl rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="website-readiness" className="text-lg font-bold text-[var(--field)]">
          Get your website live
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {doneCount} of {items.length} done{readyToPublish ? " · ready to publish" : ""}
        </p>
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.done ? "bg-[var(--leaf-dark)] text-white" : "border border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {item.done ? "✓" : ""}
            </span>
            <span>
              {item.done ? (
                <span className="text-[var(--muted)] line-through">{item.label}</span>
              ) : (
                <Link href={item.href} className="font-semibold text-[var(--field)] underline">
                  {item.label}
                </Link>
              )}
              {item.optional ? <span className="text-[var(--muted)]"> (optional)</span> : null}
              <span className="sr-only">{item.done ? " — done" : " — to do"}</span>
              {!item.done && item.hint ? (
                <span className="block text-xs text-[var(--muted)]">{item.hint}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

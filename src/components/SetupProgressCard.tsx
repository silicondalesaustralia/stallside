import Link from "next/link";
import type { SetupTaskStatus } from "@/lib/setup-tasks";
import type { setupProgressSummary } from "@/lib/setup-tasks";

type Summary = ReturnType<typeof setupProgressSummary>;

export default function SetupProgressCard({
  tasks,
  summary,
}: {
  tasks: SetupTaskStatus[];
  summary: Summary;
}) {
  if (summary.launched) {
    return (
      <div className="flex flex-[1.5] flex-col justify-between rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--dash-shadow)]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ok)]">
            Getting started
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[22px] font-bold text-[var(--field)]">
            You are live
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Required setup is complete. Revisit the checklist anytime.
          </p>
        </div>
        <Link
          href="/dashboard/getting-started"
          className="mt-4 text-sm font-semibold text-[var(--leaf)] underline"
        >
          View Getting Started
        </Link>
      </div>
    );
  }

  const next = summary.next;
  const remaining = tasks.filter((t) => !t.complete).slice(0, 3);

  return (
    <div className="relative flex min-h-[220px] flex-[1.5] flex-col overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--field)] to-[var(--leaf-dark)] p-6 text-[var(--ink-on-dark)] shadow-[var(--dash-shadow)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--marigold)]">
        Getting started · {summary.requiredDone}/{summary.requiredTotal}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-[23px] font-bold leading-tight">
        {next?.title ?? "Keep going"}
      </h2>
      <p className="mt-3 text-sm text-[var(--ink-on-dark)]/75">
        {next?.description ?? "Finish the remaining setup tasks."}
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-[var(--marigold)]"
          style={{ width: `${summary.percent}%` }}
        />
      </div>
      <ul className="mt-4 hidden space-y-1.5 sm:block">
        {remaining.map((t) => (
          <li
            key={t.id}
            className="truncate text-xs text-[var(--ink-on-dark)]/55"
          >
            · {t.title}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        {next ? (
          <Link
            href={next.href}
            className="inline-flex rounded-full bg-[var(--marigold)] px-5 py-2.5 text-sm font-bold text-[var(--field)]"
          >
            Continue
          </Link>
        ) : null}
        <Link
          href="/dashboard/getting-started"
          className="text-sm font-semibold text-white/80 underline hover:text-white"
        >
          Full checklist
        </Link>
      </div>
    </div>
  );
}

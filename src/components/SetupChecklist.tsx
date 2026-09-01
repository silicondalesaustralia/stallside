import Link from "next/link";
import type { SetupTaskStatus } from "@/lib/setup-tasks";
import type { setupProgressSummary } from "@/lib/setup-tasks";

type Summary = ReturnType<typeof setupProgressSummary>;

export default function SetupChecklist({
  tasks,
  summary,
  compact = false,
}: {
  tasks: SetupTaskStatus[];
  summary: Summary;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {summary.requiredDone} of {summary.requiredTotal} required
          {summary.launched ? " · Live" : ""}
        </p>
        <span className="text-xs font-bold text-[var(--muted)]">
          {summary.percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--leaf)] transition-[width]"
          style={{ width: `${summary.percent}%` }}
        />
      </div>
      <ul className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className={`flex items-start gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5 transition-colors ${
                task.complete
                  ? "border-transparent bg-[var(--wash)] text-[var(--muted)]"
                  : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--leaf)]"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  task.complete
                    ? "bg-[var(--ok)] text-white"
                    : "border border-[var(--line)] text-[var(--muted)]"
                }`}
                aria-hidden
              >
                {task.complete ? "✓" : task.order}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      task.complete
                        ? "line-through text-[var(--muted)]"
                        : "text-[var(--ink)]"
                    }`}
                  >
                    {task.title}
                  </span>
                  {!task.required ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                      Optional
                    </span>
                  ) : null}
                </span>
                {compact ? null : (
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {task.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

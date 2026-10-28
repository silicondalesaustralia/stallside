import type { ImportIssue } from "@/lib/data-import/import-product";

const SHOWN = 25;

export default function ImportIssueList({ issues }: { issues: ImportIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="rounded-lg border border-[var(--line)] p-3 text-sm">
      <p className="font-medium text-[var(--warn)]">
        {issues.length} row{issues.length === 1 ? "" : "s"} need attention
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[var(--muted)]">
        {issues.slice(0, SHOWN).map((issue, i) => (
          <li key={`${issue.ref}-${i}`}>
            <span className="font-medium text-[var(--field)]">{issue.ref}</span>: {issue.message}
          </li>
        ))}
      </ul>
      {issues.length > SHOWN ? (
        <p className="mt-1 text-[var(--muted)]">…and {issues.length - SHOWN} more.</p>
      ) : null}
    </div>
  );
}

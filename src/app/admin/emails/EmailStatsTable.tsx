import Link from "next/link";
import type { EmailKindStats } from "@/lib/email-stats/load-email-stats";
import { formatEmailDate, kindLabel, percent } from "@/lib/email-stats/format";

function Metric({ value, of }: { value: number; of?: number }) {
  return (
    <td className="px-3 py-3 text-right tabular-nums">
      {value.toLocaleString()}
      {of != null ? (
        <span className="block text-xs text-[var(--muted)]">{percent(value, of)}</span>
      ) : null}
    </td>
  );
}

const HEADINGS = ["Sent", "Delivered", "Opened", "Clicked", "Bounced", "Complaints", "Failed"];

export default function EmailStatsTable({ rows }: { rows: EmailKindStats[] }) {
  return (
    <div className="dash-card overflow-x-auto">
      <table className="w-full min-w-[56rem] text-sm">
        <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            {HEADINGS.map((h) => (
              <th key={h} className="px-3 py-3 text-right font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((row) => (
            <tr key={row.kind}>
              <td className="max-w-[22rem] px-4 py-3">
                <Link
                  href={`/admin/emails/${encodeURIComponent(row.kind)}`}
                  className="font-medium text-[var(--leaf-dark)] underline"
                >
                  {kindLabel(row.kind)}
                </Link>
                <span className="block truncate text-[var(--muted)]">{row.latestSubject}</span>
                <span className="block text-xs text-[var(--muted)]">
                  Last sent {formatEmailDate(row.lastSentAt)}
                </span>
              </td>
              <Metric value={row.sent} />
              <Metric value={row.delivered} of={row.sent} />
              <Metric value={row.opened} of={row.delivered} />
              <Metric value={row.clicked} of={row.delivered} />
              <Metric value={row.bounced} of={row.sent} />
              <Metric value={row.complained} of={row.delivered} />
              <Metric value={row.failed} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { EmailRecipientRow } from "@/lib/email-stats/load-email-recipients";
import { formatEmailDate } from "@/lib/email-stats/format";

const EVENT_LABEL: Record<string, string> = {
  sent: "Sent",
  delivery_delayed: "Delayed",
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  failed: "Failed",
  bounced: "Bounced",
  complained: "Marked as spam",
};

const PROBLEM_EVENTS = new Set(["failed", "bounced", "complained"]);

function statusOf(row: EmailRecipientRow): string {
  if (row.status === "failed") return "failed";
  return row.lastEvent ?? "sent";
}

export default function EmailRecipientTable({ rows }: { rows: EmailRecipientRow[] }) {
  return (
    <div className="dash-card overflow-x-auto">
      <table className="w-full min-w-[44rem] text-sm">
        <thead className="border-b border-[var(--line)] text-left text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Recipient</th>
            <th className="px-3 py-3 font-medium">Sent</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Opens</th>
            <th className="px-3 py-3 text-right font-medium">Clicks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((row) => {
            const status = statusOf(row);
            const detail = row.bounceType ?? row.error?.slice(0, 120) ?? null;
            return (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium">{row.email}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{formatEmailDate(row.sentAt)}</td>
                <td className="px-3 py-3">
                  <span className={PROBLEM_EVENTS.has(status) ? "font-medium text-red-700" : ""}>
                    {EVENT_LABEL[status] ?? status}
                  </span>
                  {detail ? (
                    <span className="block text-xs text-[var(--muted)]">{detail}</span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{row.openCount}</td>
                <td className="px-3 py-3 text-right tabular-nums">{row.clickCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

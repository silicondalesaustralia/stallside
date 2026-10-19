import type { AiVisibilityRunSummary } from "@/lib/blog/ai-visibility-queries";

function pct(part: number, total: number): string {
  return total === 0 ? "–" : `${Math.round((part / total) * 100)}%`;
}

function runDate(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Adelaide" }).format(date);
}

export default function AdminAiVisibilityTrend({ runs }: { runs: AiVisibilityRunSummary[] }) {
  return (
    <section className="dash-card overflow-x-auto p-4">
      <h2 className="mb-3 text-lg font-semibold">Weekly trend</h2>
      <table className="w-full text-left text-sm">
        <thead className="text-[var(--muted)]">
          <tr>
            <th className="py-2 pr-4 font-medium">Run</th>
            <th className="py-2 pr-4 font-medium">Vendl mentioned</th>
            <th className="py-2 pr-4 font-medium">Vendl cited</th>
            <th className="py-2 font-medium">Competitors mentioned (questions)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {runs.map((run) => (
            <tr key={run.runAt.toISOString()}>
              <td className="py-2 pr-4 whitespace-nowrap">{runDate(run.runAt)}</td>
              <td className="py-2 pr-4">
                {run.mentioned}/{run.total} <span className="text-[var(--muted)]">({pct(run.mentioned, run.total)})</span>
              </td>
              <td className="py-2 pr-4">
                {run.cited}/{run.total} <span className="text-[var(--muted)]">({pct(run.cited, run.total)})</span>
              </td>
              <td className="py-2 text-[var(--muted)]">
                {run.competitorMentions.length === 0
                  ? "None"
                  : run.competitorMentions.map((c) => `${c.name} ${c.count}`).join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

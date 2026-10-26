import Sparkline from "./Sparkline";

export type StripStat = {
  label: string;
  value: string;
  current: number;
  previous?: number;
  trend?: number[];
};

function changeLabel(current: number, previous: number | undefined) {
  if (previous == null) return null;
  if (previous === 0) return current === 0 ? null : { text: "New", up: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct >= 0 ? "↗" : "↘"} ${Math.abs(pct)}%`, up: pct >= 0 };
}

/** Slim row of headline numbers with sparklines (Shopify-style), above a list. */
export default function StatsStrip({ stats, period }: { stats: StripStat[]; period?: string }) {
  return (
    <div className="dash-card flex flex-wrap items-stretch overflow-hidden">
      {period ? (
        <div className="flex items-center border-r border-[var(--line)] px-4 py-3 text-xs font-semibold text-[var(--muted)]">
          {period}
        </div>
      ) : null}
      {stats.map((stat) => {
        const change = changeLabel(stat.current, stat.previous);
        return (
          <div
            key={stat.label}
            className="flex min-w-[150px] flex-1 items-end justify-between gap-3 border-r border-[var(--line)] px-4 py-3 last:border-r-0"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--muted)]">{stat.label}</p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-receipt text-base font-bold">{stat.value}</span>
                {change ? (
                  <span
                    className={`text-xs font-semibold ${change.up ? "text-[var(--ok)]" : "text-[var(--gone)]"}`}
                  >
                    {change.text}
                  </span>
                ) : null}
              </p>
            </div>
            {stat.trend ? <Sparkline values={stat.trend} /> : null}
          </div>
        );
      })}
    </div>
  );
}

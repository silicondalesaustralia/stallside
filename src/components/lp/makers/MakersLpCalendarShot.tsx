import { HOME_DEMO_CALENDAR_EVENTS, type MakersLpDemoEventKind } from "@/lib/makers-lp-demo-data";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
/** 1 November 2026 is a Sunday, so a Monday-first grid starts six cells earlier. */
const LEAD_DAYS = 6;
const DAYS_IN_MONTH = 30;
const TODAY = 2;

const KIND_STYLE: Record<MakersLpDemoEventKind, { dot: string; chip: string; label: string }> = {
  social: { dot: "bg-[#8b5cf6]", chip: "bg-[#f3efff] border-[#ddd3fb]", label: "Social posts" },
  pickup: { dot: "bg-[#10b981]", chip: "bg-[#ecfdf5] border-[#bdeedb]", label: "Pick-up & delivery" },
  production: { dot: "bg-[#6b7280]", chip: "bg-[#f4f4f5] border-[#e4e4e7]", label: "Production" },
};

function cellDay(index: number): { day: number; inMonth: boolean } {
  const day = index - LEAD_DAYS + 1;
  if (day < 1) return { day: 31 + day, inMonth: false };
  if (day > DAYS_IN_MONTH) return { day: day - DAYS_IN_MONTH, inMonth: false };
  return { day, inMonth: true };
}

/** Code-built preview of the Vendl calendar (month view). */
export default function MakersLpCalendarShot({ showSocial }: { showSocial: boolean }) {
  const kinds = (Object.keys(KIND_STYLE) as MakersLpDemoEventKind[]).filter((k) => showSocial || k !== "social");
  const events = HOME_DEMO_CALENDAR_EVENTS.filter((e) => kinds.includes(e.kind));

  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-white p-3 text-[var(--ink)] shadow-[0_8px_25px_#17361f16] sm:p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-[var(--field)] sm:text-base">November 2026</p>
        <span className="flex gap-1 text-[10px] font-semibold">
          <span className="rounded bg-[var(--marigold)] px-2 py-0.5 text-[var(--field)]">Month</span>
          <span className="px-2 py-0.5 text-[var(--muted)]">Week</span>
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-semibold">
        <span className="rounded-full bg-[var(--field)] px-2 py-0.5 text-white">Everything</span>
        {kinds.map((kind) => (
          <span key={kind} className="flex items-center gap-1 rounded-full border border-[var(--line)] px-2 py-0.5">
            <span className={`size-1.5 rounded-full ${KIND_STYLE[kind].dot}`} />
            {KIND_STYLE[kind].label} {events.filter((e) => e.kind === kind).length}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 overflow-hidden rounded-md border border-[var(--line)] text-[8px] sm:text-[9px]">
        {WEEKDAYS.map((d) => (
          <p key={d} className="border-b border-[var(--line)] py-1 text-center font-bold uppercase text-[var(--muted)]">
            {d}
          </p>
        ))}
        {Array.from({ length: 42 }, (_, i) => {
          const { day, inMonth } = cellDay(i);
          const dayEvents = inMonth ? events.filter((e) => e.day === day) : [];
          return (
            <div key={i} className={`min-h-[44px] border-b border-r border-[var(--line)] p-0.5 sm:min-h-[54px] sm:p-1 ${inMonth ? "" : "bg-[#fafaf9]"}`}>
              <span
                className={`inline-flex size-4 items-center justify-center rounded-full font-bold ${
                  inMonth && day === TODAY ? "bg-[var(--marigold)] text-[var(--field)]" : inMonth ? "" : "text-[var(--muted)]/60"
                }`}
              >
                {day}
              </span>
              {dayEvents.map((e) => (
                <p key={e.label} className={`mt-0.5 truncate rounded border px-1 text-[7px] font-semibold sm:text-[8px] ${KIND_STYLE[e.kind].chip}`}>
                  {e.label}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

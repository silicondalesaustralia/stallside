import Link from "next/link";
import { Suspense } from "react";
import UnifiedCalendar from "@/components/unified-calendar/UnifiedCalendar";
import {
  loadUnifiedCalendar,
  type UnifiedCalendarSearchParams,
} from "@/lib/unified-calendar/loadUnifiedCalendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<UnifiedCalendarSearchParams>;
}) {
  const data = await loadUnifiedCalendar(await searchParams);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/operate" className="underline">
            Operate
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Calendar
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Social posts, order cut-offs, pickups, deliveries, markets and your
          Google Calendar in one place. Drag to reschedule; changes save to the
          source record.
        </p>
      </div>

      <Suspense fallback={<div className="dash-card h-96 animate-pulse" />}>
        <UnifiedCalendar {...data} />
      </Suspense>
    </main>
  );
}

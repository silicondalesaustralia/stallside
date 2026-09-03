/** Rolling Saturday Farm Bake windows (Australia/Adelaide). */

const TZ = "Australia/Adelaide";

function adelaideYmd(d: Date): { y: number; m: number; day: number; dow: number } {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    y: Number(get("year")),
    m: Number(get("month")),
    day: Number(get("day")),
    dow: map[get("weekday")] ?? 1,
  };
}

/** Approximate Adelaide instant; good enough for demo menu windows. */
function atAdelaide(
  y: number,
  m: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const pad = (n: number) => String(n).padStart(2, "0");
  // Prefer +09:30; if calendar day shifts (DST), retry +10:30
  for (const offset of ["+09:30", "+10:30"] as const) {
    const d = new Date(
      `${y}-${pad(m)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${offset}`,
    );
    const got = adelaideYmd(d);
    if (got.y === y && got.m === m && got.day === day) return d;
  }
  return new Date(
    `${y}-${pad(m)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+09:30`,
  );
}

function addDays(y: number, m: number, day: number, delta: number) {
  const utc = new Date(Date.UTC(y, m - 1, day + delta));
  return {
    y: utc.getUTCFullYear(),
    m: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/**
 * Opens Monday 7:00, closes Thursday 18:00, pickup Saturday 8:00.
 * Rolls forward after Saturday midday.
 */
export function rollingSaturdayBakeDates(now = new Date()): {
  orderByAt: Date;
  collectionAt: Date;
  collectionNote: string;
} {
  const today = adelaideYmd(now);
  let daysToSat = (6 - today.dow + 7) % 7;
  if (daysToSat === 0) {
    const midday = atAdelaide(today.y, today.m, today.day, 12, 0);
    if (now.getTime() >= midday.getTime()) daysToSat = 7;
  }
  const sat = addDays(today.y, today.m, today.day, daysToSat);
  const thu = addDays(sat.y, sat.m, sat.day, -2);

  return {
    orderByAt: atAdelaide(thu.y, thu.m, thu.day, 18, 0),
    collectionAt: atAdelaide(sat.y, sat.m, sat.day, 8, 0),
    collectionNote:
      "Collect Saturday 8:00–11:00 AM from Green Valley Farm (demo). Local delivery Saturday 1:00–4:00 PM where available.",
  };
}

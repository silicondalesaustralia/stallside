import { DAY_IDS, type BusinessProfile, type DayId } from "@/lib/seo/business-profile";

export type StandHours = NonNullable<BusinessProfile["hours"]>;

export type OpenStatus = { open: boolean; label: string };

const DAY_SHORT: Record<DayId, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};
const WEEKDAY_TO_ID: Record<string, DayId> = {
  Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
};

/** "08:00" → "8am", "17:30" → "5:30pm". */
export function formatHourLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

function localNow(now: Date, timeZone: string): { day: DayId; minutes: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const day = WEEKDAY_TO_ID[get("weekday").slice(0, 3)];
    if (!day) return null;
    return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  } catch {
    return null;
  }
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Live open/closed wording from the seller's hours, in the stand's time zone. Null without hours. */
export function openStatus(hours: StandHours | null | undefined, timeZone: string, now: Date): OpenStatus | null {
  if (!hours || !DAY_IDS.some((d) => hours[d])) return null;
  const local = localNow(now, timeZone);
  if (!local) return null;
  const start = DAY_IDS.indexOf(local.day);
  const today = hours[local.day];
  if (today && local.minutes >= toMinutes(today.opens) && local.minutes < toMinutes(today.closes)) {
    return { open: true, label: `Open now · until ${formatHourLabel(today.closes)}` };
  }
  for (let offset = 0; offset < 8; offset++) {
    const day = DAY_IDS[(start + offset) % 7];
    const h = hours[day];
    if (!h || (offset === 0 && local.minutes >= toMinutes(h.opens))) continue;
    const when = offset === 0 ? "today" : offset === 1 ? "tomorrow" : DAY_SHORT[day];
    return { open: false, label: `Closed · opens ${when} ${formatHourLabel(h.opens)}` };
  }
  return null;
}

/** One line per open day, e.g. "Sat 8am–12pm". */
export function hoursLines(hours: StandHours | null | undefined): string[] {
  if (!hours) return [];
  return DAY_IDS.flatMap((d) => {
    const h = hours[d];
    return h ? [`${DAY_SHORT[d]} ${formatHourLabel(h.opens)}–${formatHourLabel(h.closes)}`] : [];
  });
}

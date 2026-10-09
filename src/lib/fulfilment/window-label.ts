const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function formatTimeMin(min: number | null | undefined): string {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}${ampm}` : `${hour12}:${String(m).padStart(2, "0")}${ampm}`;
}

/** Client-safe pickup window label (no Prisma enums). */
export function formatPickupWindowLabelPlain(input: {
  recurrence: string;
  label?: string | null;
  weekday?: number | null;
  startTimeMin?: number | null;
  endTimeMin?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
}): string {
  if (input.label?.trim()) return input.label.trim();
  if (input.recurrence === "WEEKLY" && input.weekday != null) {
    const day = WEEKDAYS[input.weekday] ?? "Day";
    const start = formatTimeMin(input.startTimeMin);
    const end = formatTimeMin(input.endTimeMin);
    if (start && end) return `${day} ${start}–${end}`;
    return day;
  }
  if (input.startsAt) {
    return input.startsAt.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "Pickup window";
}

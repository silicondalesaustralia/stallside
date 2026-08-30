/** IANA timezones for stand wall-clock dates (orders close, collection). */

export const DEFAULT_TIMEZONE = "Australia/Adelaide";

export const STAND_TIMEZONES = [
  { value: "Australia/Adelaide", label: "Adelaide (ACST/ACDT)" },
  { value: "Australia/Melbourne", label: "Melbourne / Sydney (AEST/AEDT)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
  { value: "Australia/Perth", label: "Perth (AWST)" },
  { value: "Australia/Darwin", label: "Darwin (ACST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZ)" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Denver", label: "US Mountain" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "Europe/London", label: "London (UK)" },
  { value: "Europe/Dublin", label: "Dublin (Ireland)" },
  { value: "UTC", label: "UTC" },
] as const;

export type StandTimezone = (typeof STAND_TIMEZONES)[number]["value"];

const STAND_TIMEZONE_SET = new Set<string>(
  STAND_TIMEZONES.map((z) => z.value),
);

export function isStandTimezone(value: string): value is StandTimezone {
  return STAND_TIMEZONE_SET.has(value);
}

export function resolveStandTimezone(value: string | null | undefined): string {
  if (value && isStandTimezone(value)) return value;
  return DEFAULT_TIMEZONE;
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const num = (type: Intl.DateTimeFormatPartTypes) => {
    const raw = parts.find((p) => p.type === type)?.value;
    return Number(raw);
  };

  return {
    year: num("year"),
    month: num("month"),
    day: num("day"),
    hour: num("hour"),
    minute: num("minute"),
    second: num("second"),
  };
}

/** Convert stand wall-clock digits to a real UTC instant. */
export function zonedWallClockToUtc(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const desiredAsUtc = Date.UTC(
    year,
    monthIndex,
    day,
    hour,
    minute,
    second,
  );
  let guess = desiredAsUtc;
  for (let i = 0; i < 3; i += 1) {
    const parts = zonedParts(new Date(guess), timeZone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess += desiredAsUtc - asUtc;
  }
  return new Date(guess);
}

/** `datetime-local` value in the stand's timezone. */
export function toDateTimeLocalInTz(
  d: Date | string,
  timeZone: string,
): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const parts = zonedParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatDateInTz(
  d: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-AU", { ...options, timeZone }).format(d);
}

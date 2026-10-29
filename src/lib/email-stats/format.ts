const DATE_TIME = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Adelaide",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatEmailDate(value: Date): string {
  return DATE_TIME.format(value);
}

export function percent(part: number, whole: number): string {
  if (whole <= 0) return "–";
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

export function kindLabel(kind: string): string {
  const spaced = kind.replaceAll("_", " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

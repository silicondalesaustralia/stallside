export type CsvValue = string | number | null | undefined;

function cell(value: CsvValue): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  // Neutralise spreadsheet formula injection, then quote if needed.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function money(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

/** UTF-8 BOM so Excel opens the file correctly. */
export type ExportTax = { name: string; inclusive: boolean };

/** Swaps "GST" in column headings for the owner's tax name (VAT, Sales tax…). */
export function taxHeaders(headers: readonly string[], tax: ExportTax): string[] {
  return headers.map((h) =>
    h === "Taxable sales (incl. GST)"
      ? `Taxable sales (${tax.inclusive ? "incl." : "excl."} ${tax.name})`
      : h.replace(/\bGST\b/g, tax.name),
  );
}

export function toCsv(headers: readonly string[], rows: CsvValue[][]): string {
  const lines = rows.map((row) => row.map(cell).join(","));
  return "\uFEFF" + [headers.join(","), ...lines].join("\r\n");
}

/** `YYYY-MM-DD HH:mm` in the stand's timezone. */
export function zonedDateTime(date: Date | null, timeZone: string): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export type CsvRow = { line: number; values: Record<string, string> };

/** RFC 4180 rows: quoted fields, doubled quotes, commas and newlines inside quotes. */
function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

/** Undo the export's spreadsheet-formula guard (a leading apostrophe). */
function unguard(value: string): string {
  return /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value;
}

export function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Rows keyed by normalised header; blank lines dropped. `line` is the 1-based sheet row. */
export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const records = splitRecords(text.replace(/^\uFEFF/, ""));
  const [head, ...body] = records;
  if (!head) return { headers: [], rows: [] };
  const headers = head.map(normaliseHeader);
  const rows: CsvRow[] = [];
  body.forEach((record, index) => {
    if (record.every((cell) => cell.trim() === "")) return;
    const values: Record<string, string> = {};
    headers.forEach((header, col) => {
      if (header) values[header] = unguard((record[col] ?? "").trim());
    });
    rows.push({ line: index + 2, values });
  });
  return { headers, rows };
}

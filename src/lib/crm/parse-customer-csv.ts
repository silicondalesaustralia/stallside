export type CsvContactRow = {
  email: string;
  name?: string;
  phone?: string;
};

/** Parse CSV with optional header: email, name, phone (any order). */
export function parseCustomerCsv(text: string): {
  rows: CsvContactRow[];
  error?: string;
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { rows: [], error: "CSV is empty." };

  const split = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  const first = split(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first.some((c) => c === "email" || c === "e-mail");
  let emailIdx = 0;
  let nameIdx = -1;
  let phoneIdx = -1;
  let start = 0;

  if (hasHeader) {
    emailIdx = first.findIndex((c) => c === "email" || c === "e-mail");
    nameIdx = first.findIndex((c) => c === "name" || c === "full name");
    phoneIdx = first.findIndex((c) => c === "phone" || c === "mobile");
    if (emailIdx < 0) return { rows: [], error: "CSV needs an email column." };
    start = 1;
  }

  const rows: CsvContactRow[] = [];
  const seen = new Set<string>();
  for (let i = start; i < lines.length; i += 1) {
    const cells = split(lines[i]);
    const email = (cells[emailIdx] ?? "").trim().toLowerCase();
    if (!email || !email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    rows.push({
      email,
      name: nameIdx >= 0 ? cells[nameIdx]?.trim() || undefined : undefined,
      phone: phoneIdx >= 0 ? cells[phoneIdx]?.trim() || undefined : undefined,
    });
    if (rows.length >= 5000) break;
  }

  if (rows.length === 0) {
    return { rows: [], error: "No valid email addresses found." };
  }
  return { rows };
}

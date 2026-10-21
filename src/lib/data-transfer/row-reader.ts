import type { CsvRow } from "./parse-csv";
import type { RowError } from "./context";

/** Reads one CSV row, recording a friendly error for each bad cell. */
export class RowReader {
  readonly errors: string[] = [];

  constructor(private readonly row: CsvRow) {}

  get line(): number {
    return this.row.line;
  }

  text(column: string, max = 5000): string | undefined {
    const value = this.row.values[column]?.trim();
    if (!value) return undefined;
    if (value.length > max) {
      this.errors.push(`${column} is longer than ${max} characters`);
      return undefined;
    }
    return value;
  }

  /** Runs a parser that returns "invalid" for bad input. */
  parse<T>(column: string, parser: (raw: string | undefined) => T | undefined | "invalid", hint: string): T | undefined {
    const result = parser(this.row.values[column]);
    if (result === "invalid") {
      this.errors.push(`${column} should be ${hint}`);
      return undefined;
    }
    return result;
  }

  require<T>(value: T | undefined, column: string): T | undefined {
    if (value === undefined) this.errors.push(`${column} is required`);
    return value;
  }

  toErrors(): RowError[] {
    return this.errors.map((message) => ({ line: this.row.line, message }));
  }
}

/** Flags slugs/emails that appear twice in one file. */
export function duplicateKeys(keys: (string | undefined)[], lines: number[], label: string): RowError[] {
  const seen = new Map<string, number>();
  const errors: RowError[] = [];
  keys.forEach((key, i) => {
    if (!key) return;
    const first = seen.get(key);
    if (first !== undefined) {
      errors.push({ line: lines[i], message: `${label} "${key}" is already used on row ${first}` });
    } else {
      seen.set(key, lines[i]);
    }
  });
  return errors;
}

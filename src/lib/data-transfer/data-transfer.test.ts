import assert from "node:assert/strict";
import test from "node:test";
import { toCsv } from "../order-export/csv";
import { parseCsv } from "./parse-csv";
import { createZip, readZip } from "./zip";
import { parseDollars, parseLocalDateTime, parseYesNo, splitList } from "./values";
import { CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW } from "./sections/categories-export";
import { CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW } from "./sections/customers-export";
import { PREORDER_HEADERS, PREORDER_TEMPLATE_ROW } from "./sections/preorders-export";
import { PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW } from "./sections/products-export";
import { SUBSCRIPTION_HEADERS, SUBSCRIPTION_TEMPLATE_ROW } from "./sections/subscriptions-export";

const TEMPLATES: [string, readonly string[], readonly (string | number)[]][] = [
  ["categories", CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW],
  ["customers", CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW],
  ["preorders", PREORDER_HEADERS, PREORDER_TEMPLATE_ROW],
  ["products", PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW],
  ["subscriptions", SUBSCRIPTION_HEADERS, SUBSCRIPTION_TEMPLATE_ROW],
];

test("templates have one value per header and parse back", () => {
  for (const [name, headers, row] of TEMPLATES) {
    assert.equal(row.length, headers.length, name);
    const parsed = parseCsv(toCsv(headers, [[...row]]));
    assert.deepEqual(parsed.headers, [...headers], name);
    assert.equal(parsed.rows.length, 1, name);
  }
});

test("csv round-trips quotes, newlines, BOM and formula guard", () => {
  const csv = "\uFEFF" + toCsv(["name", "description"], [["=SUM(A1)", 'Line "one"\nline, two']]);
  const { rows } = parseCsv(csv);
  assert.equal(rows[0].values.name, "=SUM(A1)");
  assert.equal(rows[0].values.description, 'Line "one"\nline, two');
});

test("zip round-trips entries", () => {
  const big = Buffer.alloc(100_000, 65);
  const zip = createZip([
    { name: "products.csv", data: Buffer.from("a,b\n1,2") },
    { name: "big.csv", data: big },
  ]);
  const entries = readZip(zip);
  assert.deepEqual(entries.map((e) => e.name), ["products.csv", "big.csv"]);
  assert.equal(entries[1].data.equals(big), true);
});

test("value parsers", () => {
  assert.equal(parseDollars("$12.50"), 1250);
  assert.equal(parseDollars(""), undefined);
  assert.equal(parseDollars("abc"), "invalid");
  assert.equal(parseYesNo("Yes"), true);
  assert.equal(parseYesNo("maybe"), "invalid");
  assert.deepEqual(splitList("a| b ||c"), ["a", "b", "c"]);
  const when = parseLocalDateTime("2026-12-23 09:00", "Australia/Sydney");
  assert.ok(when instanceof Date);
  assert.equal(when.toISOString(), "2026-12-22T22:00:00.000Z");
});

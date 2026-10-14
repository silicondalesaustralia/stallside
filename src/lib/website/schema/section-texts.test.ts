import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fillTextVars,
  parseSectionTexts,
  sectionText,
  sectionTextsSchema,
  withSectionText,
} from "../../studio/section-texts";

test("sectionText falls back when missing or blank", () => {
  assert.equal(sectionText(undefined, "a", "Default"), "Default");
  assert.equal(sectionText({ a: "  " }, "a", "Default"), "Default");
  assert.equal(sectionText({ a: "Custom" }, "a", "Default"), "Custom");
});

test("fillTextVars replaces known placeholders only", () => {
  assert.equal(fillTextVars("{count} products {other}", { count: 3 }), "3 products {other}");
  assert.equal(fillTextVars("Plain"), "Plain");
});

test("withSectionText stores, resets on blank, and resets when equal to default", () => {
  const set = withSectionText(undefined, "label", "Hours", "Stand hours");
  assert.deepEqual(set, { label: "Hours" });
  assert.deepEqual(withSectionText(set, "label", "", "Stand hours"), {});
  assert.deepEqual(withSectionText(set, "label", "Stand hours", "Stand hours"), {});
});

test("schema rejects bad keys, long values and too many keys", () => {
  assert.equal(sectionTextsSchema.safeParse({ "bad key": "x" }).success, false);
  assert.equal(sectionTextsSchema.safeParse({ ok: "x".repeat(301) }).success, false);
  const many = Object.fromEntries(Array.from({ length: 41 }, (_, i) => [`k${i}`, "x"]));
  assert.equal(sectionTextsSchema.safeParse(many).success, false);
  assert.deepEqual(parseSectionTexts("nope"), {});
});

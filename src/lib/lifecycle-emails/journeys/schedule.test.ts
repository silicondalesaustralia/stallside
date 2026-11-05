import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dueStage, wholeDaysSince } from "./schedule";

const STAGES = [
  { key: "a", day: 3 },
  { key: "b", day: 6 },
  { key: "c", day: 10 },
];

describe("dueStage", () => {
  it("returns nothing before the first stage", () => {
    assert.equal(dueStage(STAGES, 2, new Set()), null);
  });

  it("returns the stage whose window contains today", () => {
    assert.equal(dueStage(STAGES, 3, new Set())?.key, "a");
    assert.equal(dueStage(STAGES, 7, new Set())?.key, "b");
  });

  it("never sends a missed earlier stage (no backlog)", () => {
    assert.equal(dueStage(STAGES, 8, new Set(["b"])), null);
    assert.equal(dueStage(STAGES, 8, new Set())?.key, "b");
  });

  it("does not repeat a handled stage", () => {
    assert.equal(dueStage(STAGES, 4, new Set(["a"])), null);
  });

  it("closes the last stage after its grace period", () => {
    assert.equal(dueStage(STAGES, 17, new Set())?.key, "c");
    assert.equal(dueStage(STAGES, 18, new Set()), null);
  });
});

describe("wholeDaysSince", () => {
  it("counts full days", () => {
    const start = new Date("2026-11-01T10:00:00Z");
    assert.equal(wholeDaysSince(start, new Date("2026-11-04T09:59:00Z")), 2);
    assert.equal(wholeDaysSince(start, new Date("2026-11-04T10:00:00Z")), 3);
  });
});

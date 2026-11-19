import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contribution, contributionRate, unitCost } from "./calculator";

describe("sell calculator", () => {
  it("matches the candle blueprint example", () => {
    const cost = unitCost(68, 12, 0.8);
    assert.equal(cost, 6.47);
    const contrib = contribution(18, cost);
    assert.equal(contrib, 11.53);
    assert.equal(contributionRate(18, contrib), 64.1);
  });

  it("matches the cookie pack example", () => {
    assert.equal(unitCost(48, 8, 0.5), 6.5);
  });

  it("matches crochet one-piece labour example", () => {
    assert.equal(unitCost(39, 1, 1), 40);
  });

  it("rejects non-positive yield", () => {
    assert.throws(() => unitCost(10, 0, 1), /greater than zero/i);
  });
});

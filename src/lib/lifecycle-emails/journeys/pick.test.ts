import assert from "node:assert/strict";
import { test } from "node:test";
import { FREE_JOURNEY, PRO_JOURNEY, RECOVERY_JOURNEY } from "./catalog";
import { pickJourneyStep, type JourneyState } from "./pick";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-12-01T09:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * DAY);

function state(over: Partial<JourneyState>): JourneyState {
  return { isPro: false, proAnchor: null, hasProducts: true, createdAt: ago(0), handled: new Set(), ...over };
}

test("catalog has 16 Free, 4 recovery and 9 Pro emails with unique keys", () => {
  assert.equal(FREE_JOURNEY.length, 16);
  assert.equal(RECOVERY_JOURNEY.length, 4);
  assert.equal(PRO_JOURNEY.length, 9);
  const keys = [...FREE_JOURNEY, ...RECOVERY_JOURNEY, ...PRO_JOURNEY].map((e) => e.key);
  assert.equal(new Set(keys).size, keys.length);
});

test("Free owner with products gets the Free stage for their age", () => {
  const pick = pickJourneyStep(state({ createdAt: ago(3) }), now);
  assert.ok(pick && pick.kind === "send");
  assert.equal(pick.email.key, "free_d03");
});

test("Free Day 0 is never sent by the cron", () => {
  assert.equal(pickJourneyStep(state({ createdAt: ago(1) }), now), null);
});

test("owner without products gets recovery instead of Free", () => {
  const pick = pickJourneyStep(state({ hasProducts: false, createdAt: ago(7) }), now);
  assert.ok(pick && pick.kind === "send");
  assert.equal(pick.journey, "recovery");
  assert.equal(pick.email.key, "recovery_d07");
});

test("Pro owner without an anchor starts Pro onboarding", () => {
  assert.deepEqual(pickJourneyStep(state({ isPro: true, createdAt: ago(30) }), now), { kind: "start_pro" });
});

test("Pro stage follows the Pro anchor, not signup date", () => {
  const pick = pickJourneyStep(state({ isPro: true, proAnchor: ago(3), createdAt: ago(40) }), now);
  assert.ok(pick && pick.kind === "send");
  assert.equal(pick.email.key, "pro_d03");
});

test("handled stage is not resent", () => {
  const pick = pickJourneyStep(state({ createdAt: ago(4), handled: new Set(["free_d03"]) }), now);
  assert.equal(pick, null);
});

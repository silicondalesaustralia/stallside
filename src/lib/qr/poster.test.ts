import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CTA, posterFromStand, resolvePoster, type PosterStandDefaults } from "./poster";

const stand: PosterStandDefaults = {
  name: "Hilltop Eggs",
  locationLabel: "Gate on Example Rd",
  qrCallout: null,
  qrSignMessage: "<p>Scan to pay</p>",
  description: null,
  posterShowCta: true,
  posterCtaText: null,
  posterShowInstructions: true,
  posterShowBundles: false,
  posterShowFirstOrder: true,
  posterShowFreshness: false,
  posterShowHowItWorks: false,
};

test("new QR codes start from the business's sign settings", () => {
  const poster = resolvePoster(null, stand);
  assert.deepEqual(poster, posterFromStand(stand));
  assert.equal(poster.title, "Hilltop Eggs");
  assert.equal(poster.ctaText, DEFAULT_CTA);
  assert.equal(poster.qrCallout, "");
});

test("saved poster fields win, and unreadable saves fall back to defaults", () => {
  const saved = resolvePoster({ title: "Egg fridge", showBundles: true }, stand);
  assert.equal(saved.title, "Egg fridge");
  assert.equal(saved.showBundles, true);
  assert.equal(saved.locationLabel, "Gate on Example Rd");
  assert.deepEqual(resolvePoster({ title: 42 }, stand), posterFromStand(stand));
});

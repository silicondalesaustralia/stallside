import { test } from "node:test";
import assert from "node:assert/strict";
import { searchProfileFacts, searchProfileSummary } from "./context/search-profile";
import { prefillBrief } from "./brief/prefill";
import { factsForPrompt } from "./ai/facts";
import { fixtureBrief, fixtureContext } from "./test-fixtures";

const PROFILE = {
  businessType: "farm-stand",
  address: { street: "1 Test Lane", locality: "Testville", region: "SA", postcode: "5000", country: "AU" },
  showStreetAddress: false,
  hours: { sat: { opens: "08:00", closes: "12:00" } },
  knowsAbout: ["Free-range eggs"],
  awards: ["Gold medal, Test Show 2024"],
  returnPolicy: { accepted: true, days: 7 },
};

test("search profile facts respect the hidden street address and format hours", () => {
  const f = searchProfileFacts(PROFILE);
  assert.equal(f.complete, true);
  assert.equal(f.businessType, "Farm stand / farm shop");
  assert.equal(f.location, "Testville, SA, 5000");
  assert.deepEqual(f.hours, ["Sat 08:00–12:00"]);
  assert.equal(f.returns, "Returns accepted within 7 days");
  assert.ok(searchProfileSummary(f).includes("Opening hours"));
});

test("empty or invalid profiles are incomplete and contribute nothing", () => {
  const f = searchProfileFacts({ hours: { sat: { opens: "8am", closes: "noon" } } });
  assert.equal(f.complete, false);
  assert.deepEqual(f.hours, []);
  assert.deepEqual(searchProfileSummary(f), []);
});

test("profile feeds prompt facts and prefill, never the reverse", () => {
  const ctx = fixtureContext({ searchProfile: searchProfileFacts(PROFILE) });
  const facts = factsForPrompt(ctx, fixtureBrief());
  assert.deepEqual(facts.searchProfile.openingHours, ["Sat 08:00–12:00"]);
  assert.deepEqual(facts.searchProfile.awards, ["Gold medal, Test Show 2024"]);
  const brief = prefillBrief({ ...ctx, existing: { ...ctx.existing, regionLabel: null } });
  assert.equal(brief.business.serviceArea, "Testville, SA, 5000");
  assert.equal(brief.business.differentiators, "Gold medal, Test Show 2024");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseDesign } from "./compile/design";
import { parseBriefData } from "./brief/schema";
import { lookSectionOptions } from "./brief/look";
import { pageTargets } from "./plan/targets";
import { normalizePlan } from "./plan/normalize";
import { availableSections } from "./plan/section-rules";
import { fixtureBrief, fixtureContext } from "./test-fixtures";

const homeOf = (brief = fixtureBrief()) => {
  const target = pageTargets(fixtureContext(), brief).find((t) => t.kind === "home");
  assert.ok(target);
  return target;
};

test("briefs saved before Look & features still load with everything on auto", () => {
  const old: Record<string, unknown> = { ...fixtureBrief() };
  delete old.look;
  const parsed = parseBriefData(old);
  assert.equal(parsed.business.name, fixtureBrief().business.name);
  assert.deepEqual(parsed.look, { style: "auto", richness: "auto", productPage: "auto", sections: null });
});

test("only sections the business has data for are offered", () => {
  const offered = lookSectionOptions(availableSections(fixtureContext()));
  assert.ok(offered.includes("faq"));
  assert.ok(offered.includes("newsletter"));
  const noReviews = fixtureContext({ reviews: { ...fixtureContext().reviews, count: 0 } });
  assert.ok(!lookSectionOptions(availableSections(noReviews)).includes("reviews"));
});

test("homepage size follows the seller's choice", () => {
  const simple = homeOf(fixtureBrief((b) => { b.look.richness = "simple"; }));
  assert.equal(simple.maxSections, 4);
  assert.ok(simple.defaultSections.length <= 4);
  assert.ok(homeOf(fixtureBrief((b) => { b.look.richness = "full"; })).maxSections >= 9);
});

test("chosen sections are required and unchosen ones are left out", () => {
  const home = homeOf(fixtureBrief((b) => { b.look.sections = ["faq"]; }));
  assert.ok(home.requiredSections.includes("faq"));
  assert.ok(home.defaultSections.includes("faq"));
  assert.ok(!home.allowedSections.includes("signup"));
});

test("a page missing from the AI plan starts from its default sections", () => {
  const targets = pageTargets(fixtureContext(), fixtureBrief());
  const home = normalizePlan(null, targets).pages.find((p) => p.target.kind === "home");
  assert.ok(home);
  assert.ok(home.sections.length > 1, "home should get more than just the hero");
});

test("style and product page choices reach the design", () => {
  const rustic = chooseDesign(fixtureContext(), fixtureBrief((b) => { b.look.style = "rustic"; }));
  const bold = chooseDesign(fixtureContext(), fixtureBrief((b) => { b.look.style = "bold"; }));
  assert.notEqual(rustic.blueprintId, bold.blueprintId);
  const compact = chooseDesign(fixtureContext(), fixtureBrief((b) => { b.look.productPage = "compact"; }));
  assert.equal(compact.productLayout, "simple");
  const big = chooseDesign(fixtureContext(), fixtureBrief((b) => { b.look.productPage = "big"; }));
  assert.equal(big.productLayout, "featured");
});

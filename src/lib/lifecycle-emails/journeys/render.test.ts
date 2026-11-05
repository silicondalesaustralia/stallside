import assert from "node:assert/strict";
import { test } from "node:test";
import { journeyEmail } from "./catalog";
import { ctaHref, renderJourneyEmail } from "./render";

function render(key: string, over: Partial<{ name: string; currency: string; dfyLive: boolean }> = {}) {
  const email = journeyEmail(key);
  assert.ok(email, key);
  return renderJourneyEmail(email, { name: "Sam", currency: "AUD", dfyLive: false, ...over });
}

test("fee examples follow the owner's currency", () => {
  assert.match(render("free_d51"), /A\$1,000/);
  assert.match(render("free_d51", { currency: "GBP" }), /£1,000/);
  assert.match(render("free_d51", { currency: "NZD" }), /\$1,000/);
});

test("bold markers and signature render", () => {
  const html = render("free_d00");
  assert.doesNotMatch(html, /\*\*/);
  assert.match(html, /Co-Founder, Vendl/);
  assert.match(html, /Unsubscribe/);
});

test("Done-For-You sentence only shows when live", () => {
  assert.doesNotMatch(render("pro_d00"), /Done-For-You/i);
  assert.match(render("pro_d00", { dfyLive: true }), /Done-For-You/i);
});

test("names are escaped", () => {
  assert.doesNotMatch(render("free_d00", { name: "<b>x</b>" }), /<b>x<\/b>/);
});

test("absolute CTA links are kept", () => {
  assert.equal(ctaHref("https://www.skool.com/x"), "https://www.skool.com/x");
  assert.match(ctaHref("/dashboard"), /\/dashboard$/);
});

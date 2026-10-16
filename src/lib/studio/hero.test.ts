import { test } from "node:test";
import assert from "node:assert/strict";
import { formatHourLabel, hoursLines, openStatus } from "./open-status";
import { heroPickerValue, resolveHeroStyle } from "./hero-styles";
import { missingHeroNeed, type HeroFacts } from "./hero-needs";
import { parseHeroLook } from "./hero-look";
import { visitFacts } from "./visit-facts";

const TZ = "Australia/Adelaide";
const hours = { sat: { opens: "08:00", closes: "12:00" }, sun: { opens: "09:30", closes: "13:00" } };
// Saturday 17 Oct 2026, local Adelaide times (UTC+10:30).
const at = (local: string) => new Date(`2026-10-17T${local}:00+10:30`);

test("open status reads the stand's own time zone", () => {
  assert.deepEqual(openStatus(hours, TZ, at("09:00")), { open: true, label: "Open now · until 12pm" });
  assert.deepEqual(openStatus(hours, TZ, at("07:00")), { open: false, label: "Closed · opens today 8am" });
  assert.deepEqual(openStatus(hours, TZ, at("12:00")), { open: false, label: "Closed · opens tomorrow 9:30am" });
  assert.equal(openStatus({}, TZ, at("09:00")), null);
  assert.equal(openStatus(null, TZ, at("09:00")), null);
});

test("hours read as short lines", () => {
  assert.equal(formatHourLabel("17:30"), "5:30pm");
  assert.equal(formatHourLabel("00:00"), "12am");
  assert.deepEqual(hoursLines(hours), ["Sat 8am–12pm", "Sun 9:30am–1pm"]);
});

test("older layouts still resolve and show as selected", () => {
  assert.equal(resolveHeroStyle("farmhouse", "simple"), "stand-status");
  assert.equal(resolveHeroStyle("market", "spotlight"), "shop-first");
  assert.equal(resolveHeroStyle("artisan", undefined), "background");
  assert.equal(resolveHeroStyle("artisan", "category-mosaic"), "category-mosaic");
  assert.equal(resolveHeroStyle("farmhouse", "produce-split"), "produce-split");
  assert.equal(heroPickerValue("farmhouse", "produce-split"), "split");
});

test("styles say what they're missing", () => {
  const none: HeroFacts = { hasPhoto: false, productCount: 0, categoryCount: 1, hasMenu: false, hasCountdownMenu: false, hasHours: false };
  assert.match(missingHeroNeed("background", none) ?? "", /hero image/);
  assert.match(missingHeroNeed("category-mosaic", none) ?? "", /two categories/);
  assert.match(missingHeroNeed("countdown", { ...none, hasMenu: true }) ?? "", /pre-order/);
  assert.equal(missingHeroNeed("minimal", none), null);
});

test("look settings default to the original look and drop bad values", () => {
  const look = parseHeroLook({ height: "huge", overlay: "strong", secondaryLabel: "  Visit  ", secondaryLink: "javascript:alert(1)" });
  assert.equal(look.height, "medium");
  assert.equal(look.overlay, "strong");
  assert.equal(look.secondaryLabel, "Visit");
  assert.equal(look.secondaryLink, undefined);
  assert.equal(parseHeroLook({ secondaryLink: "page:contact" }).secondaryLink, "page:contact");
});

test("visit facts keep the street private unless shown", () => {
  const hidden = visitFacts({ address: { street: "1 Farm Rd", locality: "Hahndorf", region: "SA" }, hours }, TZ, null);
  assert.equal(hidden.locality, "Hahndorf");
  assert.ok(hidden.directionsUrl?.includes("Hahndorf"));
  assert.ok(!hidden.directionsUrl?.includes("Farm"));
  assert.deepEqual(hidden.standHours, { hours, timeZone: TZ });
  assert.equal(visitFacts({}, TZ, null).directionsUrl, null);
});

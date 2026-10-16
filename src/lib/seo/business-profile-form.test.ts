import { test } from "node:test";
import assert from "node:assert/strict";
import { profileFromForm } from "./business-profile-form";
import { withPickupPrefill } from "./profile-prefill";

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

test("reads lists, hours, links and returns from the form", () => {
  const r = profileFromForm(
    form({
      businessType: "bakery",
      knowsAbout: "Sourdough, Croissants\nRye",
      sameAs: "instagram.com/bakery\nhttps://www.yelp.com/biz/bakery",
      googleBusinessProfileUrl: "g.page/bakery",
      hours_sat_opens: "07:00",
      hours_sat_closes: "13:00",
      hours_sun_opens: "07:00",
      returnsAccepted: "no",
    }),
  );
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(r.profile.knowsAbout, ["Sourdough", "Croissants", "Rye"]);
  assert.deepEqual(r.profile.sameAs, ["https://instagram.com/bakery", "https://www.yelp.com/biz/bakery"]);
  assert.equal(r.profile.googleBusinessProfileUrl, "https://g.page/bakery");
  assert.deepEqual(r.profile.hours, { sat: { opens: "07:00", closes: "13:00" } });
  assert.deepEqual(r.profile.returnPolicy, { accepted: false });
});

test("an empty form saves an empty profile", () => {
  const r = profileFromForm(form({}));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(JSON.parse(JSON.stringify(r.profile)), {});
});

test("country accepts names or codes; country alone saves no address", () => {
  const named = profileFromForm(form({ locality: "Testville", country: "Australia" }));
  assert.ok(named.ok);
  if (named.ok) assert.equal(named.profile.address?.country, "AU");
  const alias = profileFromForm(form({ locality: "Testville", country: "uk" }));
  if (alias.ok) assert.equal(alias.profile.address?.country, "GB");
  const only = profileFromForm(form({ country: "AU" }));
  if (only.ok) assert.equal(only.profile.address, undefined);
});

test("reports the first invalid field by name", () => {
  const r = profileFromForm(form({ foundingDate: "last year" }));
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /^foundingDate:/);
});

test("pickup location prefills address only when none is saved", () => {
  const pickup = { addressLine1: "1 Farm Rd", suburb: "Bangalow", stateTerritory: "NSW", postcode: "2479", latitude: -28.6, longitude: 153.5 };
  const filled = withPickupPrefill({}, pickup, "AUD");
  assert.equal(filled.address?.locality, "Bangalow");
  assert.deepEqual(filled.geo, { lat: -28.6, lng: 153.5 });
  const kept = withPickupPrefill({ address: { locality: "Mullum" } }, pickup, "AUD");
  assert.equal(kept.address?.locality, "Mullum");
});

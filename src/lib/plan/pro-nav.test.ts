import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { visibleNavGroups } from "@/components/dash-nav-links";

const links = (isPro: boolean) => visibleNavGroups(true, true, isPro).flatMap((g) => g.links);
const locked = (isPro: boolean) => links(isPro).filter((l) => l.proLocked).map((l) => l.href);

const ALWAYS_FREE = [
  "/dashboard/products",
  "/dashboard/pre-order-pages",
  "/dashboard/subscriptions",
  "/dashboard/orders",
  "/dashboard/customers",
  "/dashboard/collections",
  "/dashboard/upsells",
  "/dashboard/shipping",
  "/dashboard/qr",
  "/dashboard/data",
  "/dashboard/social",
  "/dashboard/settings/tax",
];

describe("Pro sidebar chips", () => {
  it("chips Pro-only sections for Free owners", () => {
    const hrefs = locked(false);
    for (const href of ["/dashboard/discounts", "/dashboard/communication", "/dashboard/reviews", "/dashboard/calendar", "/dashboard/production"]) {
      assert.ok(hrefs.includes(href), `${href} should be Pro`);
    }
    assert.ok(hrefs.some((h) => h.startsWith("/dashboard/website/")));
  });

  it("keeps the selling basics, subscriptions, memberships and pre-orders free", () => {
    const hrefs = locked(false);
    for (const href of ALWAYS_FREE) assert.ok(!hrefs.includes(href), `${href} should stay free`);
  });

  it("shows no chips to Pro owners", () => {
    assert.deepEqual(locked(true), []);
  });
});

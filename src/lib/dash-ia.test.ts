import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dashLinkActive,
  hubNavForPath,
  hubNavItemActive,
  mobileTabsForMode,
  primaryNavForMode,
  secondaryNavForMode,
} from "@/components/dash-nav-links";

describe("dashboard IA (Phase 8C)", () => {
  it("primary nav stays small and mode-aware", () => {
    const farm = primaryNavForMode("FARM_STAND");
    assert.equal(farm.some((i) => i.href === "/dashboard/menus"), false);
    assert.equal(farm.some((i) => i.href === "/dashboard/businesses"), true);
    assert.ok(farm.length >= 8 && farm.length <= 10);

    const food = primaryNavForMode("FOOD_BUSINESS");
    assert.equal(food.some((i) => i.href === "/dashboard/menus"), true);
    assert.equal(food.some((i) => i.href === "/dashboard/businesses"), false);
  });

  it("secondary nav includes legacy tools without duplicating primary", () => {
    const secondary = secondaryNavForMode("BOTH");
    const primaryHrefs = new Set(primaryNavForMode("BOTH").map((i) => i.href));
    assert.ok(secondary.some((i) => i.href === "/dashboard/production"));
    assert.ok(secondary.some((i) => i.href === "/dashboard/operate"));
    for (const item of secondary) {
      if (item.href !== "/dashboard/businesses") {
        assert.equal(primaryHrefs.has(item.href), false);
      }
    }
  });

  it("hubNavForPath maps major areas", () => {
    const orders = hubNavForPath("/dashboard/orders");
    assert.ok(orders?.some((i) => i.label === "All"));

    const products = hubNavForPath("/dashboard/recipes");
    assert.ok(products?.some((i) => i.label === "Recipes"));

    const marketing = hubNavForPath("/dashboard/campaigns/new");
    assert.ok(marketing?.some((i) => i.label === "Campaigns"));

    assert.equal(hubNavForPath("/dashboard/menus"), null);
    const pack = hubNavForPath("/dashboard/fulfilment/orders/abc");
    assert.ok(pack?.some((i) => i.label === "Prepare & pack"));
  });

  it("hubNavItemActive treats order detail as All orders", () => {
    assert.equal(
      hubNavItemActive("/dashboard/orders/ord_1", {
        href: "/dashboard/orders",
        label: "All",
        matchPrefix: "/dashboard/orders",
      }),
      true,
    );
    assert.equal(
      hubNavItemActive("/dashboard/fulfilment/orders/ord_1", {
        href: "/dashboard/fulfilment/orders?view=today",
        label: "Prepare & pack",
        matchPrefix: "/dashboard/fulfilment/orders",
      }),
      true,
    );
  });

  it("dashLinkActive highlights marketing cluster", () => {
    assert.equal(
      dashLinkActive("/dashboard/coupons", "/dashboard/marketing"),
      true,
    );
    assert.equal(
      dashLinkActive("/dashboard/grow", "/dashboard/marketing"),
      true,
    );
  });

  it("mobile tabs simplify by mode", () => {
    assert.equal(mobileTabsForMode("FARM_STAND").length, 4);
    assert.equal(mobileTabsForMode("FOOD_BUSINESS").length, 5);
    assert.ok(
      mobileTabsForMode("FOOD_BUSINESS").some((t) => t.href === "/dashboard/menus"),
    );
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rollingSaturdayBakeDates } from "./dates";
import { buildGreenValleyHomeNodes } from "./starter-nodes";
import {
  GREEN_VALLEY_PRODUCTS,
  GREEN_VALLEY_CATEGORIES,
} from "./catalogue";
import {
  isWebsiteDemoStorefrontSlug,
  GREEN_VALLEY_DEMO_STOREFRONT_SLUG,
} from "./constants";
import { findStudioCanvasParentId } from "@/lib/studio/page-canvas";

describe("green valley demo fixture", () => {
  it("has 12 products and 5 categories", () => {
    assert.equal(GREEN_VALLEY_PRODUCTS.length, 12);
    assert.equal(GREEN_VALLEY_CATEGORIES.length, 5);
  });

  it("builds distinct home trees per template", () => {
    const a = buildGreenValleyHomeNodes("artisan");
    const f = buildGreenValleyHomeNodes("farmhouse");
    const m = buildGreenValleyHomeNodes("market");
    const canvas = findStudioCanvasParentId(a);
    assert.ok(a[canvas]?.nodes?.length);
    assert.notEqual(
      JSON.stringify(a[canvas]?.nodes),
      JSON.stringify(f[canvas]?.nodes),
    );
    assert.ok(
      Object.values(f).some(
        (n) =>
          typeof n.type === "object" &&
          n.type?.resolvedName === "CraftFarmStandSection",
      ),
    );
    assert.ok(m[findStudioCanvasParentId(m)]?.nodes?.length);
  });

  it("rolls Saturday bake dates into the future", () => {
    const { orderByAt, collectionAt } = rollingSaturdayBakeDates(
      new Date("2026-09-02T03:00:00.000Z"),
    );
    assert.ok(collectionAt.getTime() > orderByAt.getTime());
    assert.ok(collectionAt.getTime() > Date.now() - 8 * 24 * 60 * 60 * 1000);
  });

  it("recognises demo storefront slug", () => {
    assert.equal(isWebsiteDemoStorefrontSlug(GREEN_VALLEY_DEMO_STOREFRONT_SLUG), true);
    assert.equal(isWebsiteDemoStorefrontSlug("other-shop"), false);
  });
});

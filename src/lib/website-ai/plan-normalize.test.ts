import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aiSitePlanSchema,
  coerceDesignSystem,
  normalizeAiPlanRaw,
} from "./plan-schema";

describe("normalizeAiPlanRaw", () => {
  it("coerces Astra freeform designSystem object and href navigation", () => {
    const raw = {
      designSystem: {
        style: "Warm farm-to-table",
        colors: { primary: "#355E3B" },
      },
      navigation: {
        items: [
          { label: "Home", href: "/" },
          { label: "Farm Stand", href: "/farm-stand" },
          { label: "Shop", href: "/shop" },
        ],
      },
      pages: [
        {
          pageType: "HOME",
          title: "Home",
          sections: [
            { id: "h", type: "HeroBanner", headline: "Hi" },
            { id: "f", type: "FarmStand" },
            { id: "p", type: "ProductGrid" },
            { id: "s", type: "Signup" },
            { id: "t", type: "Text", body: "x" },
          ],
        },
      ],
    };
    assert.equal(coerceDesignSystem(raw.designSystem), "farmhouse");
    const parsed = aiSitePlanSchema.safeParse(normalizeAiPlanRaw(raw));
    assert.equal(parsed.success, true);
    if (!parsed.success) return;
    assert.equal(parsed.data.designSystem, "farmhouse");
    assert.deepEqual(
      parsed.data.navigation.map((n) => n.pageType),
      ["HOME", "FARM_STAND", "SHOP"],
    );
    assert.equal(parsed.data.pages[0]!.sections[0]!.type, "Hero");
  });
});

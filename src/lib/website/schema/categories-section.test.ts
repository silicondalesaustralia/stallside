import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { categoryLookOf } from "@/lib/studio/category-looks";
import { categoryRatings } from "@/lib/studio/category-ratings";
import { CATEGORY_PRESETS } from "@/lib/studio/preset-registry";

describe("categories section", () => {
  it("renders each saved style, with skin aliases and unknown values falling back", () => {
    assert.equal(categoryLookOf("shop-cards"), "tiles");
    assert.equal(categoryLookOf("horizontal"), "horizontal");
    assert.equal(categoryLookOf("circles"), "circles");
    assert.equal(categoryLookOf("nonsense"), "tiles");
    assert.equal(categoryLookOf(undefined), "tiles");
  });

  it("offers every skin the shared styles once", () => {
    for (const options of Object.values(CATEGORY_PRESETS)) {
      const values = options.map((o) => o.value);
      assert.equal(new Set(values).size, values.length);
      for (const look of ["overlay", "circles", "list", "banner"]) assert.ok(values.some((v) => v === look));
    }
  });

  it("averages approved product reviews per category", () => {
    const ratings = categoryRatings(
      [
        { productId: "eggs", categoryId: "dairy" },
        { productId: "milk", categoryId: "dairy" },
        { productId: "eggs", categoryId: "breakfast" },
        { productId: "kale", categoryId: "veg" },
      ],
      [
        { productId: "eggs", ratingSum: 9, count: 2 },
        { productId: "milk", ratingSum: 4, count: 1 },
        { productId: null, ratingSum: 5, count: 1 },
      ],
    );
    assert.deepEqual(ratings.get("dairy"), { average: 4.3, count: 3 });
    assert.deepEqual(ratings.get("breakfast"), { average: 4.5, count: 2 });
    assert.equal(ratings.has("veg"), false);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapLegacyStandRest } from "./legacy-stand-rest";
import { productRelativePath } from "@/lib/catalogue/main-category";

describe("mapLegacyStandRest", () => {
  it("maps catalogue and commerce paths", () => {
    assert.equal(mapLegacyStandRest([]), "/");
    assert.equal(mapLegacyStandRest(["cart"]), "/cart");
    assert.equal(mapLegacyStandRest(["c", "dozens"]), "/dozens");
    assert.equal(mapLegacyStandRest(["pre"]), "/pre-orders");
    assert.equal(mapLegacyStandRest(["pre", "box"]), "/pre-orders/box");
    assert.equal(mapLegacyStandRest(["sub"]), "/subscriptions");
    assert.equal(mapLegacyStandRest(["sub", "monthly"]), "/subscriptions/monthly");
    assert.equal(mapLegacyStandRest(["menu"]), "/menus");
  });

  it("leaves pay and subscription manage on the farmstand", () => {
    assert.equal(mapLegacyStandRest(["pay"]), null);
    assert.equal(mapLegacyStandRest(["sub", "manage", "tok"]), null);
  });

  it("flags lone segments as products for category resolution", () => {
    assert.deepEqual(mapLegacyStandRest(["dozen-eggs"]), { product: "dozen-eggs" });
    assert.equal(productRelativePath("dozen-eggs", null), "/products/dozen-eggs");
    assert.equal(productRelativePath("dozen-eggs", "bakery"), "/bakery/dozen-eggs");
  });
});

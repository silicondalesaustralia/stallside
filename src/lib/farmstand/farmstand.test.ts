import { test } from "node:test";
import assert from "node:assert/strict";
import { farmstandRootPath, standPathFromFarmstand, withCartModePath } from "./paths";
import { farmstandPathFor, type FarmstandLookup } from "../tenancy/farmstand-routing";

const unpublished: FarmstandLookup = { isPublished: false, mainStandSlug: "eggs", standSlugs: ["eggs", "bakery"] };
const published: FarmstandLookup = { ...unpublished, isPublished: true };

test("farmstand links", () => {
  assert.equal(farmstandRootPath("Eggs", true), "/farmstand");
  assert.equal(farmstandRootPath("bakery", false), "/farmstand/bakery");
  assert.equal(withCartModePath("https://a.vendl.app/farmstand", "CUSTOMER_CHOICE"), "https://a.vendl.app/farmstand/pay");
  assert.equal(withCartModePath("https://a.vendl.app/farmstand", "PRODUCT"), "https://a.vendl.app/farmstand");
});

test("seller-host paths map to stand pages", () => {
  assert.equal(farmstandPathFor("/", unpublished), "/s/eggs");
  assert.equal(farmstandPathFor("/", published), null);
  assert.equal(farmstandPathFor("/farmstand", published), "/s/eggs");
  assert.equal(farmstandPathFor("/farmstand/c/dozens", published), "/s/eggs/c/dozens");
  assert.equal(farmstandPathFor("/farmstand/bakery/cart", published), "/s/bakery/cart");
  assert.equal(farmstandPathFor("/farmstand/pay", published), "/s/eggs/pay");
  assert.equal(farmstandPathFor("/s/bakery/cart", published), "/s/bakery/cart");
  assert.equal(farmstandPathFor("/s/someone-else", published), null);
  assert.equal(farmstandPathFor("/about", unpublished), null);
});

test("menu highlighting reads farmstand paths", () => {
  assert.equal(standPathFromFarmstand("/", "eggs"), "/s/eggs");
  assert.equal(standPathFromFarmstand("/farmstand/pre", "eggs"), "/s/eggs/pre");
  assert.equal(standPathFromFarmstand("/farmstand/bakery/sub", "bakery"), "/s/bakery/sub");
  assert.equal(standPathFromFarmstand("/s/eggs/cart", "eggs"), "/s/eggs/cart");
});

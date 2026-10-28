import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runImport as run } from "./import-test-utils";

function products(csv: string) {
  const { preset, built } = run(csv, "products");
  assert.equal(built.entity, "products");
  return { preset, items: built.entity === "products" ? built.items : [], issues: built.issues };
}

describe("platform product imports", () => {
  it("groups Shopify variant rows by handle and skips image-only rows", () => {
    const { preset, items } = products(
      [
        "Handle,Title,Body (HTML),Type,Option1 Name,Option1 Value,Variant SKU,Variant Inventory Qty,Variant Price,Variant Taxable,Image Src,Status",
        "tee,Tee,<p>Soft &amp; warm</p>,Shirts,Size,S,TEE-S,3,25.00,TRUE,https://cdn.shopify.com/a.jpg,active",
        "tee,,,,,M,TEE-M,0,27.00,,,",
        "tee,,,,,,,,,,https://cdn.shopify.com/b.jpg,",
        "honey,Honey,,,Title,Default Title,HON-1,12,9.50,FALSE,,draft",
      ].join("\n"),
    );
    assert.equal(preset?.id, "shopify-products");
    assert.equal(items.length, 2);
    const tee = items.find((p) => p.name === "Tee")!;
    assert.deepEqual(tee.optionNames, ["Size"]);
    assert.deepEqual(tee.variants.map((v) => [v.values[0], v.sku, v.stock, v.priceCents]), [
      ["S", "TEE-S", 3, 2500],
      ["M", "TEE-M", 0, 2700],
    ]);
    assert.equal(tee.description, "Soft & warm");
    assert.equal(tee.priceCents, 2500);
    const honey = items.find((p) => p.name === "Honey")!;
    assert.equal(honey.variants.length, 0);
    assert.equal(honey.stock, 12);
    assert.equal(honey.gstFree, true);
    assert.equal(honey.hidden, true);
  });

  it("attaches WooCommerce variations to their variable parent", () => {
    const { preset, items } = products(
      [
        "ID,Type,SKU,Name,Published,Description,Tax status,Stock,Sale price,Regular price,Categories,Images,Parent,Attribute 1 name,Attribute 1 value(s)",
        "10,variable,JAM,Jam,1,Homemade,taxable,,,,Pantry > Preserves,https://x.test/j.jpg,,Flavour,\"Fig, Plum\"",
        "11,variation,JAM-F,Jam - Fig,1,,taxable,4,7.00,8.00,,,id:10,Flavour,Fig",
        "12,variation,JAM-P,Jam - Plum,1,,taxable,2,,8.00,,,JAM,Flavour,Plum",
        "13,simple,EGG,Eggs,1,,none,30,,6.50,Fresh,,,,",
      ].join("\n"),
    );
    assert.equal(preset?.id, "woocommerce-products");
    const jam = items.find((p) => p.name === "Jam")!;
    assert.equal(jam.category, "Preserves");
    assert.deepEqual(jam.variants.map((v) => [v.values[0], v.priceCents, v.compareAtCents, v.stock]), [
      ["Fig", 700, 800, 4],
      ["Plum", 800, null, 2],
    ]);
    const eggs = items.find((p) => p.name === "Eggs")!;
    assert.equal(eggs.gstFree, true);
    assert.equal(eggs.stock, 30);
  });

  it("adds Wix variant surcharges to the product price", () => {
    const { preset, items } = products(
      [
        "handleId,fieldType,name,description,productImageUrl,collection,sku,price,surcharge,visible,inventory,productOptionName1,productOptionDescription1",
        "p1,Product,Candle,,abc~mv2.jpg,Home,,20,,TRUE,InStock,Size,Small;Large",
        "p1,Variant,,,,,C-S,,,,5,,Small",
        "p1,Variant,,,,,C-L,,4,,2,,Large",
      ].join("\n"),
    );
    assert.equal(preset?.id, "wix-products");
    const candle = items[0];
    assert.equal(candle.imageUrl, "https://static.wixstatic.com/media/abc~mv2.jpg");
    assert.deepEqual(candle.variants.map((v) => [v.values[0], v.priceCents, v.stock]), [
      ["Small", 2000, 5],
      ["Large", 2400, 2],
    ]);
  });

  it("uses Square variation names as options and reads location stock", () => {
    const { preset, items } = products(
      [
        "Token,Item Name,Variation Name,SKU,Description,Categories,Price,Archived,Current Quantity Main St,Tax - GST (10%)",
        "a,Coffee,250g,C250,,Drinks,14.00,N,8,Y",
        "b,Coffee,1kg,C1K,,Drinks,45.00,N,3,Y",
        "c,Bread,Regular,BR,,Bakery,6.00,N,10,N",
      ].join("\n"),
    );
    assert.equal(preset?.id, "square-items");
    const coffee = items.find((p) => p.name === "Coffee")!;
    assert.deepEqual(coffee.optionNames, ["Option"]);
    assert.deepEqual(coffee.variants.map((v) => [v.values[0], v.stock]), [["250g", 8], ["1kg", 3]]);
    const bread = items.find((p) => p.name === "Bread")!;
    assert.equal(bread.variants.length, 0);
    assert.equal(bread.gstFree, true);
  });

  it("maps an unknown spreadsheet by column aliases", () => {
    const { preset, items } = products("Product Name,Unit Price,Qty,SKU\nTomatoes,4.50,20,TOM\n");
    assert.equal(preset, null);
    assert.equal(items[0].priceCents, 450);
    assert.equal(items[0].stock, 20);
  });
});

describe("customer imports", () => {
  it("only opts in customers marked as subscribed", () => {
    const { preset, built } = run(
      [
        "First Name,Last Name,Email,Accepts Email Marketing,Phone,Note",
        "Sam,Lee,SAM@x.test,yes,0400,VIP",
        "Jo,,jo@x.test,no,,",
        "Nobody,,,yes,,",
      ].join("\n"),
      "customers",
    );
    assert.equal(preset?.id, "shopify-customers");
    assert.equal(built.entity, "customers");
    if (built.entity !== "customers") return;
    assert.deepEqual(built.items.map((c) => [c.email, c.name, c.marketingConsent]), [
      ["sam@x.test", "Sam Lee", true],
      ["jo@x.test", "Jo", false],
    ]);
    assert.equal(built.issues.length, 1);
  });
});

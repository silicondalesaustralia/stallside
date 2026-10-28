import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { importCustomers, importProducts, importStock } from "./import-test-utils";

describe("current platform export formats", () => {
  it("reads Shopify's current product CSV headers", () => {
    const { preset, items } = importProducts([
      "Title,URL handle,Description,Type,Status,SKU,Barcodes,Option1 name,Option1 value,Price,Compare-at price,Charge tax,Inventory quantity,Product image URL",
      "Jam,jam,<p>Fig</p>,Pantry,active,J-S,gtin:00012345678905; upc:012345678905,Size,Small,8.00,10.00,false,4,https://cdn.shopify.com/j.jpg",
      ",jam,,,,J-L,,,Large,12.00,,,2,",
      ",jam,,,,,,,,,,,,https://cdn.shopify.com/j2.jpg",
    ]);
    assert.equal(preset?.id, "shopify-products");
    assert.equal(items.length, 1);
    const jam = items[0];
    assert.equal(jam.gstFree, true);
    assert.equal(jam.imageUrl, "https://cdn.shopify.com/j.jpg");
    assert.deepEqual(jam.variants.map((v) => [v.values[0], v.priceCents, v.compareAtCents, v.stock, v.upc]), [
      ["Small", 800, 1000, 4, "00012345678905"],
      ["Large", 1200, null, 2, null],
    ]);
  });

  it("adds up Shopify inventory across locations", () => {
    const { preset, items } = importStock([
      "Handle,Title,Option1 Name,Option1 Value,SKU,Location,Available (not editable),On hand (current),On hand (new)",
      "jam,Jam,Size,Small,J-S,Shed,3,3,",
      "jam,Jam,Size,Small,J-S,Market,2,2,",
      "jam,Jam,Size,Large,J-L,Shed,Not stocked,Not stocked,",
    ]);
    assert.equal(preset?.id, "shopify-inventory");
    assert.deepEqual(items.map((i) => [i.sku, i.values, i.stock]), [["J-S", ["Small"], 5]]);
  });

  it("reads Wix's current export with MEDIA rows and swatch choices", () => {
    const { preset, items } = importProducts([
      "handle,fieldType,name,visible,plainDescription,categorySlugs,media,price,strikethroughPrice,inventory,sku,productOptionName1,productOptionType1,productOptionChoices1",
      "mug,PRODUCT,Mug,TRUE,Glazed,Kitchen;Gifts,,30,,,,Colour,SWATCH_CHOICES,#FFFFFF:White;#000000:Black",
      "mug,VARIANT,,,,,,30,35,6,M-W,,,#FFFFFF:White",
      "mug,VARIANT,,,,,,32,,OUT_OF_STOCK,M-B,,,#000000:Black",
      "mug,MEDIA,,,,,abc~mv2.jpg,,,,,,,",
      "soap,PRODUCT,Soap,FALSE,,,,9,,12,SO-1,,,",
    ]);
    assert.equal(preset?.id, "wix-products-v3");
    const mug = items.find((p) => p.name === "Mug")!;
    assert.equal(mug.imageUrl, "https://static.wixstatic.com/media/abc~mv2.jpg");
    assert.equal(mug.category, "Kitchen");
    assert.deepEqual(mug.variants.map((v) => [v.values[0], v.priceCents, v.compareAtCents, v.stock]), [
      ["White", 3000, 3500, 6],
      ["Black", 3200, null, 0],
    ]);
    const soap = items.find((p) => p.name === "Soap")!;
    assert.equal(soap.hidden, true);
    assert.equal(soap.stock, 12);
  });

  it("treats a classic Wix default variant row as a simple product and applies discounts", () => {
    const { preset, items } = importProducts([
      "handleId,fieldType,name,price,discountMode,discountValue,inventory,sku,productOptionName1,productOptionDescription1",
      "p2,Product,Honey,20,PERCENT,10,InStock,,,",
      "p2,Variant,,,,,7,HON,,",
    ]);
    assert.equal(preset?.id, "wix-products");
    const honey = items[0];
    assert.equal(honey.variants.length, 0);
    assert.deepEqual([honey.priceCents, honey.compareAtCents, honey.sku, honey.stock], [1800, 2000, "HON", 7]);
  });

  it("joins Squarespace option rows to their first product row", () => {
    const { preset, items } = importProducts([
      "Product ID [Non Editable],Variant ID [Non Editable],Product Type [Non Editable],Product Page,Product URL,Title,Description,SKU,Option Name 1,Option Value 1,Price,Sale Price,On Sale,Stock,Categories,Tags,Visible,Hosted Image URLs",
      ",,PHYSICAL,shop,pickles,Pickled Things,Crunchy,PK-B,Flavour,Beets,9.00,,No,5,/pantry/pickled-veg,,Yes,https://x.test/p.jpg",
      ",,,,,,,PK-K,Flavour,Kimchi,11.00,8.00,Yes,unlimited,,,,",
    ]);
    assert.equal(preset?.id, "squarespace-products");
    assert.equal(items.length, 1);
    const pickles = items[0];
    assert.equal(pickles.category, "Pickled veg");
    assert.deepEqual(pickles.variants.map((v) => [v.values[0], v.priceCents, v.compareAtCents, v.stock]), [
      ["Beets", 900, null, 5],
      ["Kimchi", 800, 1100, 9999],
    ]);
  });
});

describe("current customer export formats", () => {
  it("recognises Square (Last Name), WooCommerce and Squarespace customer files", () => {
    const square = importCustomers([
      "First Name,Last Name,Email Address,Phone Number,Email Subscription Status,Memo",
      "Ana,Ng,ana@x.test,0400,Subscribed,Regular",
    ]);
    assert.equal(square.preset?.id, "square-customers");
    assert.deepEqual(square.items.map((c) => [c.name, c.marketingConsent, c.notes]), [["Ana Ng", true, "Regular"]]);

    const woo = importCustomers([
      "Name,Username,Last active,Date registered,Email,Orders,Total spend,AOV,Country / Region,Billing phone",
      "Bo Li,boli,2026-10-01,2025-01-01,bo@x.test,3,90.00,30.00,AU,0411",
    ]);
    assert.equal(woo.preset?.id, "woocommerce-customers");
    assert.deepEqual(woo.items.map((c) => [c.name, c.phone, c.marketingConsent]), [["Bo Li", "0411", false]]);

    const sqsp = importCustomers([
      "Account,First Name,Last Name,Email,Total Orders,Total Spent,Customer Since,Tags",
      "No,Cy,Ho,cy@x.test,1,20,2026-01-01,",
    ]);
    assert.equal(sqsp.preset?.id, "squarespace-customers");
    assert.equal(sqsp.items[0].name, "Cy Ho");
  });
});

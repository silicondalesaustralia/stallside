import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFeedCatalog } from "./build-items";
import { serializeChatgptCsv } from "./chatgpt-csv";
import { csvCell, feedCountry, feedGtin, feedMoney } from "./format";
import { serializeGmcXml } from "./gmc-xml";

const baseInput = {
  slug: "green-acres",
  brandName: "Green Acres",
  homeUrl: "https://green-acres.vendl.app",
  primaryCustomHostname: null as string | null,
  currency: "AUD",
  country: "AU",
  acceptsReturns: false as boolean | null,
  returnDays: null as number | null,
};

test("feedMoney and country helpers", () => {
  assert.equal(feedMoney(1999, "aud"), "19.99 AUD");
  assert.equal(feedCountry("nz", "AUD"), "NZ");
  assert.equal(feedCountry(null, "AUD"), "AU");
  assert.equal(feedGtin("036000291452"), "036000291452");
  assert.equal(feedGtin("bad"), null);
  assert.equal(csvCell(`a "b", c`), `"a ""b"", c"`);
});

test("buildFeedCatalog expands variants and skips products without images", () => {
  const catalog = buildFeedCatalog({
    ...baseInput,
    products: [
      {
        id: "p1",
        slug: "eggs",
        name: "Free range eggs",
        description: "<p>Dozen eggs</p>",
        imageUrl: "https://cdn.example/eggs.jpg",
        galleryImageUrls: ["https://cdn.example/eggs-2.jpg"],
        priceCents: 1200,
        compareAtPriceCents: 1500,
        stockQuantity: 10,
        sku: "EGGS",
        upc: "036000291452",
        currency: "AUD",
        isPreOrder: false,
        collectionAt: null,
        shippingCents: 500,
        option1Name: "Size",
        option2Name: null,
        option3Name: null,
        mainCategorySlug: "dairy",
        categoryTitle: "Dairy",
        variants: [
          {
            id: "v1",
            option1: "Dozen",
            option2: null,
            option3: null,
            sku: "EGGS-12",
            upc: null,
            priceCents: 1200,
            compareAtCents: 1500,
            stockQuantity: 4,
            imageUrl: null,
          },
          {
            id: "v2",
            option1: "Half dozen",
            option2: null,
            option3: null,
            sku: "EGGS-6",
            upc: null,
            priceCents: 700,
            compareAtCents: null,
            stockQuantity: 0,
            imageUrl: null,
          },
        ],
      },
      {
        id: "p2",
        slug: "no-photo",
        name: "No photo",
        description: null,
        imageUrl: null,
        galleryImageUrls: [],
        priceCents: 100,
        compareAtPriceCents: null,
        stockQuantity: 1,
        sku: null,
        upc: null,
        currency: "AUD",
        isPreOrder: false,
        collectionAt: null,
        shippingCents: null,
        option1Name: null,
        option2Name: null,
        option3Name: null,
        mainCategorySlug: null,
        categoryTitle: null,
        variants: [],
      },
    ],
  });

  assert.equal(catalog.items.length, 2);
  assert.equal(catalog.items[0].id, "EGGS-12");
  assert.equal(catalog.items[0].groupId, "p1");
  assert.equal(catalog.items[0].availability, "in_stock");
  assert.equal(catalog.items[0].compareAtPriceCents, 1500);
  assert.equal(catalog.items[1].availability, "out_of_stock");
  assert.match(catalog.items[0].link, /\/dairy\/eggs/);
});

test("serializeGmcXml includes required Google attributes", () => {
  const catalog = buildFeedCatalog({
    ...baseInput,
    products: [
      {
        id: "p1",
        slug: "jam",
        name: "Berry jam",
        description: "Homemade jam",
        imageUrl: "https://cdn.example/jam.jpg",
        galleryImageUrls: [],
        priceCents: 850,
        compareAtPriceCents: null,
        stockQuantity: 2,
        sku: "JAM",
        upc: null,
        currency: "AUD",
        isPreOrder: false,
        collectionAt: null,
        shippingCents: 0,
        option1Name: null,
        option2Name: null,
        option3Name: null,
        mainCategorySlug: null,
        categoryTitle: "Pantry",
        variants: [],
      },
    ],
  });
  const xml = serializeGmcXml(catalog);
  assert.match(xml, /xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0"/);
  assert.match(xml, /<g:id>JAM<\/g:id>/);
  assert.match(xml, /<g:availability>in_stock<\/g:availability>/);
  assert.match(xml, /<g:price>8\.50 AUD<\/g:price>/);
  assert.match(xml, /<g:brand>Green Acres<\/g:brand>/);
  assert.match(xml, /<g:condition>new<\/g:condition>/);
});

test("serializeChatgptCsv writes required discovery columns", () => {
  const catalog = buildFeedCatalog({
    ...baseInput,
    products: [
      {
        id: "p1",
        slug: "honey",
        name: "Local honey",
        description: "500g jar",
        imageUrl: "https://cdn.example/honey.jpg",
        galleryImageUrls: [],
        priceCents: 1400,
        compareAtPriceCents: null,
        stockQuantity: 5,
        sku: null,
        upc: null,
        currency: "AUD",
        isPreOrder: true,
        collectionAt: new Date("2026-12-01T00:00:00.000Z"),
        shippingCents: null,
        option1Name: null,
        option2Name: null,
        option3Name: null,
        mainCategorySlug: null,
        categoryTitle: null,
        variants: [],
      },
    ],
  });
  const csv = serializeChatgptCsv(catalog);
  assert.match(csv, /^item_id,title,description,url,brand,seller_name/);
  assert.match(csv, /pre_order/);
  assert.match(csv, /14\.00 AUD/);
  assert.match(csv, /"\[""AU""\]"/);
  assert.match(csv, /,AU\n/);
});

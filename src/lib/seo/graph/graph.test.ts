import { test } from "node:test";
import assert from "node:assert/strict";
import type { PublicProductCard } from "@/lib/public-product";
import { parseBusinessProfile } from "../business-profile";
import type { SiteFacts } from "../site-facts";
import { businessNode, openingHours } from "./business";
import { clean } from "./clean";
import { buildPageGraph } from "./page-graph";
import { productNode } from "./product";

const facts = (profile: unknown = {}): SiteFacts => ({
  slug: "green-acres",
  primaryCustomHostname: "greenacres.example",
  homeUrl: "https://greenacres.example",
  name: "Green Acres",
  description: "Veg and eggs",
  logoUrl: "https://cdn.example/logo.png",
  imageUrl: null,
  email: "hi@greenacres.example",
  phone: null,
  regionLabel: "Byron Bay",
  currency: "AUD",
  businessMode: "FARM_STAND",
  socialUrls: ["https://instagram.com/greenacres"],
  profile: parseBusinessProfile(profile),
});

const product = (extra: Partial<PublicProductCard> = {}) =>
  ({
    id: "p1",
    slug: "eggs",
    name: "Eggs",
    description: null,
    imageUrl: null,
    images: ["https://cdn.example/eggs.jpg"],
    priceCents: 800,
    compareAtPriceCents: null,
    stockQuantity: 20,
    soldOut: false,
    isPreOrder: false,
    collectionAtMs: null,
    ...extra,
  }) as PublicProductCard;

test("clean drops empty values recursively", () => {
  assert.deepEqual(clean({ a: "", b: [], c: { d: undefined }, e: 0, f: ["x", null] }), { e: 0, f: ["x"] });
});

test("profile parser keeps valid fields and drops bad ones", () => {
  const p = parseBusinessProfile({ legalName: "Green Acres Pty Ltd", sameAs: ["not a url"], priceRange: "$$" });
  assert.deepEqual(p, { legalName: "Green Acres Pty Ltd", priceRange: "$$" });
  assert.deepEqual(parseBusinessProfile(null), {});
});

test("opening hours group days with the same times", () => {
  const spec = openingHours({ sat: { opens: "08:00", closes: "12:00" }, sun: { opens: "08:00", closes: "12:00" } });
  assert.equal(spec.length, 1);
  assert.deepEqual(spec[0].dayOfWeek, ["Saturday", "Sunday"]);
});

test("local business hides street address unless allowed and merges sameAs", () => {
  const node = businessNode(
    facts({
      address: { street: "1 Farm Rd", locality: "Bangalow", postcode: "2479" },
      googleBusinessProfileUrl: "https://g.page/greenacres",
      sameAs: ["https://instagram.com/greenacres/"],
    }),
  );
  assert.equal(node["@type"], "Store");
  const address = node.address as Record<string, unknown>;
  assert.equal(address.streetAddress, undefined);
  assert.equal(address.addressCountry, "AU");
  assert.deepEqual(node.sameAs, ["https://g.page/greenacres", "https://instagram.com/greenacres/"]);
});

test("online shops are not given local-only fields", () => {
  const node = businessNode(facts({ businessType: "online", priceRange: "$", geo: { lat: 1, lng: 2 } }));
  assert.equal(node["@type"], "OnlineStore");
  assert.equal(node.priceRange, undefined);
  assert.equal(node.geo, undefined);
});

test("product on sale gets a strikethrough price, shipping, returns and stars", () => {
  const node = clean(
    productNode({
      product: product({ compareAtPriceCents: 1000 }),
      pageUrl: "https://greenacres.example/products/eggs",
      homeUrl: "https://greenacres.example",
      brandName: "Green Acres",
      currency: "AUD",
      rating: { average: 4.6, count: 12 },
      shipping: { rateCents: 0, country: "AU" },
      returnPolicy: { accepted: true, days: 14 },
    }),
  );
  const offer = node.offers as Record<string, Record<string, unknown>>;
  assert.equal(offer.price as unknown, "8.00");
  assert.equal(offer.priceSpecification.price, "10.00");
  assert.equal(offer.hasMerchantReturnPolicy.merchantReturnDays, 14);
  assert.ok(offer.shippingDetails);
  assert.equal((node.aggregateRating as Record<string, unknown>).reviewCount, 12);
});

test("pre-orders are marked PreOrder", () => {
  const node = productNode({
    product: product({ isPreOrder: true }),
    pageUrl: "https://x.example/products/eggs",
    homeUrl: "https://x.example",
    brandName: "X",
    currency: "AUD",
  });
  assert.equal((node.offers as Record<string, unknown>).availability, "https://schema.org/PreOrder");
});

test("page graph links webpage, website, business, breadcrumb and FAQ", () => {
  const graph = buildPageGraph(facts(), {
    path: "/faq",
    name: "FAQ",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "FAQ" }],
    faq: [{ id: "1", question: "Do you deliver?", answer: "<p>Yes, <b>Fridays</b>.</p>" }],
  })["@graph"] as Record<string, unknown>[];
  const types = graph.map((n) => n["@type"]);
  assert.ok(types.includes("WebSite"));
  assert.ok(types.includes("BreadcrumbList"));
  const page = graph.find((n) => Array.isArray(n["@type"]));
  assert.deepEqual(page?.["@type"], ["WebPage", "FAQPage"]);
  const q = graph.find((n) => n["@type"] === "Question") as Record<string, Record<string, unknown>>;
  assert.equal(q.acceptedAnswer.text, "Yes, Fridays.");
});

test("pages without seo only describe the business and website", () => {
  const graph = buildPageGraph(facts())["@graph"] as Record<string, unknown>[];
  assert.deepEqual(graph.map((n) => n["@type"]), ["Store", "WebSite"]);
});

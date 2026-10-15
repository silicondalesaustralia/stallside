import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { robotsTxt, sitemapXml } from "./serialize";

describe("sitemapXml", () => {
  it("writes escaped urls with optional fields", () => {
    const xml = sitemapXml([
      { url: "https://shop.example/eggs/a&b", lastModified: new Date("2026-10-15T00:00:00Z"), changeFrequency: "weekly", priority: 0.8 },
      { url: "https://shop.example/" },
    ]);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<url><loc>https:\/\/shop.example\/eggs\/a&amp;b<\/loc><lastmod>2026-10-15T00:00:00.000Z<\/lastmod><changefreq>weekly<\/changefreq><priority>0.8<\/priority><\/url>/);
    assert.match(xml, /<url><loc>https:\/\/shop.example\/<\/loc><\/url>/);
  });
});

describe("robotsTxt", () => {
  it("lists rules then the sitemap", () => {
    assert.equal(
      robotsTxt({ allow: ["/"], disallow: ["/craft-preview"], sitemap: "https://shop.example/sitemap.xml" }),
      "User-agent: *\nAllow: /\nDisallow: /craft-preview\n\nSitemap: https://shop.example/sitemap.xml\n",
    );
  });
});

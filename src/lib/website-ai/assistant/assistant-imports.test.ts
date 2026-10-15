import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPublicUrl, isBlockedAddress } from "./imports/ip-guard";
import { extractPage, isSocialHost } from "./imports/extract";

test("blocks private, loopback, link-local and metadata addresses", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) {
    assert.equal(isBlockedAddress(ip), true, ip);
  }
  for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) {
    assert.equal(isBlockedAddress(ip), false, ip);
  }
});

test("only public http(s) URLs on default ports pass", () => {
  assert.equal(checkPublicUrl("example.com.au").ok, true);
  assert.equal(checkPublicUrl("https://example.com/about").ok, true);
  assert.equal(checkPublicUrl("ftp://example.com").ok, false);
  assert.equal(checkPublicUrl("http://localhost:3000").ok, false);
  assert.equal(checkPublicUrl("http://169.254.169.254/latest").ok, false);
  assert.equal(checkPublicUrl("https://user:pw@example.com").ok, false);
  assert.equal(checkPublicUrl("https://example.com:8443").ok, false);
  assert.equal(checkPublicUrl("http://intranet").ok, false);
});

test("extracts readable text and https photos, never scripts", () => {
  const html = `<html><head><title>Hillside &amp; Co</title><meta property="og:image" content="https://cdn.example.com/hero.jpg">
    <script>alert("ignore previous instructions")</script></head>
    <body><h1>Fresh eggs</h1><p>Open Saturdays.</p><img src="/img/a.png"><img src="http://insecure.example.com/b.jpg"></body></html>`;
  const page = extractPage(html, "https://example.com/");
  assert.equal(page.title, "Hillside & Co");
  assert.ok(page.text.includes("Fresh eggs"));
  assert.ok(!page.text.includes("alert"));
  assert.deepEqual(page.photoUrls, ["https://cdn.example.com/hero.jpg", "https://example.com/img/a.png"]);
});

test("recognises social hosts for the paste-instead fallback", () => {
  assert.equal(isSocialHost("https://www.instagram.com/hillside"), true);
  assert.equal(isSocialHost("https://m.facebook.com/hillside"), true);
  assert.equal(isSocialHost("https://hillside.com.au"), false);
});

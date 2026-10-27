import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { knowledgeCategories, START_HERE_SLUGS } from "./categories";

const APP_DIR = path.join(process.cwd(), "src", "app");
const ROUTE_FILES = ["page.tsx", "page.ts", "route.ts", "route.tsx"];

function subdirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** True when an App Router page or route handler serves `segments` below `dir`. */
function routeExists(dir: string, segments: string[]): boolean {
  if (segments.length === 0 && ROUTE_FILES.some((file) => existsSync(path.join(dir, file)))) return true;
  return subdirs(dir).some((name) => {
    const child = path.join(dir, name);
    if (name.startsWith("(") && name.endsWith(")")) return routeExists(child, segments);
    if (name.startsWith("[[...")) return true;
    if (segments.length === 0) return false;
    if (name.startsWith("[...")) return true;
    if (name.startsWith("[") || name === segments[0]) return routeExists(child, segments.slice(1));
    return false;
  });
}

function pathSegments(href: string): string[] {
  const pathname = href.split(/[?#]/)[0];
  return pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
}

const articles = knowledgeCategories.flatMap((category) => category.articles);
const slugs = new Set(articles.map((article) => article.slug));

test("article slugs are unique", () => {
  const seen = new Set<string>();
  for (const article of articles) {
    assert.ok(!seen.has(article.slug), `Duplicate guide slug: ${article.slug}`);
    seen.add(article.slug);
  }
});

test("related and Start here guides exist", () => {
  for (const article of articles) {
    for (const related of article.related) {
      assert.ok(slugs.has(related), `"${article.slug}" lists missing related guide "${related}"`);
    }
  }
  for (const slug of START_HERE_SLUGS) assert.ok(slugs.has(slug), `Start here lists missing guide "${slug}"`);
});

test("button links point at pages that exist", () => {
  for (const article of articles) {
    for (const cta of article.ctas) {
      if (!cta.href.startsWith("/")) continue;
      assert.ok(
        routeExists(APP_DIR, pathSegments(cta.href)),
        `"${article.slug}" button "${cta.label}" links to ${cta.href}, which has no page in src/app`,
      );
    }
  }
});

test("route check catches a missing page", () => {
  assert.equal(routeExists(APP_DIR, pathSegments("/dashboard/products")), true);
  assert.equal(routeExists(APP_DIR, pathSegments("/dashboard/no-such-page-xyz")), false);
});

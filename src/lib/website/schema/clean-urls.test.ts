import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSiteSlugOwner,
  shadowedSiteSlugs,
  siteSlugProblem,
  suggestSiteSlug,
  type SiteSlugOwner,
} from "../../storefront/site-slugs";
import { blogPostRelativePath, mainBlogTopic, withDefaultBlogTopic } from "../../studio/blog-topics";
import { extractStorefrontRedirects } from "../../studio/redirects";
import { withRenameRedirect, withoutRedirectFrom } from "../../studio/rename-redirects";

const owners: SiteSlugOwner[] = [
  { kind: "blogCategory", id: "t1", slug: "eggs", label: "Egg news" },
  { kind: "category", id: "c1", slug: "eggs", label: "Eggs" },
  { kind: "page", id: "p1", slug: "story", label: "Our story" },
];

test("pages win, then product categories, then blog categories", () => {
  assert.equal(resolveSiteSlugOwner("eggs", owners)?.kind, "category");
  assert.equal(resolveSiteSlugOwner("story", owners)?.kind, "page");
  assert.equal(resolveSiteSlugOwner("shop", owners), null);
  assert.deepEqual(shadowedSiteSlugs(owners).map((o) => o.id), ["t1"]);
});

test("siteSlugProblem rejects reserved, malformed and taken slugs", () => {
  assert.match(siteSlugProblem("products", owners) ?? "", /reserved/);
  assert.match(siteSlugProblem("Bad Slug", owners) ?? "", /lowercase/);
  assert.match(siteSlugProblem("story", owners) ?? "", /Our story/);
  assert.equal(siteSlugProblem("story", owners, { kind: "page", id: "p1" }), null);
  assert.equal(siteSlugProblem("honey", owners), null);
  assert.equal(suggestSiteSlug("eggs", owners), "eggs-2");
  assert.equal(suggestSiteSlug("blog", owners), "blog-2");
});

test("blog posts always sit under a category", () => {
  const topics = [{ id: "a", slug: "recipes", name: "Recipes" }];
  assert.equal(withDefaultBlogTopic(topics).length, 2);
  const base = { slug: "omelette", topicIds: [] as string[] };
  assert.equal(blogPostRelativePath(base, topics), "/news/omelette");
  assert.equal(blogPostRelativePath({ ...base, topicIds: ["a"] }, topics), "/recipes/omelette");
  assert.equal(mainBlogTopic({ topicIds: ["a"], mainTopicId: "missing" }, topics).id, "a");
});

test("rename redirects flatten chains and clear reused paths", () => {
  let cfg: unknown = withRenameRedirect({}, "/a", "/b");
  cfg = withRenameRedirect(cfg, "/b", "/c");
  const list = extractStorefrontRedirects(cfg).map((r) => [r.fromPath, r.toPath, r.code]);
  assert.deepEqual(list, [["/a", "/c", 301], ["/b", "/c", 301]]);
  cfg = withRenameRedirect(cfg, "/c", "/a");
  assert.deepEqual(extractStorefrontRedirects(cfg).map((r) => [r.fromPath, r.toPath]), [["/b", "/a"], ["/c", "/a"]]);
  assert.deepEqual(extractStorefrontRedirects(withoutRedirectFrom(cfg, "/b")).map((r) => r.fromPath), ["/c"]);
});

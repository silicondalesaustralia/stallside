import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractWebsiteStudio,
  mergeWebsiteStudioIntoRaw,
  mergeWebsiteStudioPageIntoRaw,
  extractStudioFromDraft,
} from "./storage";
import { canInsertStudioSection } from "./section-registry";
import { validateStudioNodes } from "./validate-state";
import {
  defaultHeroPreset,
  defaultProductPreset,
  HERO_PRESETS,
  PRODUCT_PRESETS,
  mapProductPreset,
  mapCategoryPreset,
} from "./preset-registry";
import { STUDIO_TEMPLATES, templatePresetMaps } from "./templates";
import { resolveStudioPublicContext, shopPageTitle } from "./public-context";
import {
  isValidPageSlug,
  ensureCustomPages,
  customPagesNeedSync,
  mergeCustomPagesIntoRaw,
} from "./custom-pages";
import {
  ensureBlogSettings,
  extractBlogPosts,
  listVisibleBlogPosts,
  newBlogPost,
  isValidBlogSlug,
  defaultBlogSettings,
} from "./blog";
import { buildStudioHeaderNav } from "./navigation";
import {
  resolveSeoFields,
  seoRobotsIndex,
} from "./seo-settings";
import { buildStorefrontBreadcrumbs } from "../storefront/technical-seo/breadcrumbs";
import {
  commerceKeyForKind,
  commerceKindFromParam,
} from "./commerce-pages";
import {
  findStorefrontRedirect,
  normalizeRedirectPath,
  sanitizeRedirectInput,
  storefrontRelativePath,
} from "./redirects";

describe("template preset registry", () => {
  it("exposes distinct preset sets per template", () => {
    const artisanHero = HERO_PRESETS.artisan.map((p) => p.value);
    const farmhouseHero = HERO_PRESETS.farmhouse.map((p) => p.value);
    const marketHero = HERO_PRESETS.market.map((p) => p.value);
    assert.notDeepEqual(artisanHero, farmhouseHero);
    assert.notDeepEqual(farmhouseHero, marketHero);
    assert.notDeepEqual(artisanHero, marketHero);
  });

  it("maps template-specific product presets to render variants", () => {
    assert.equal(mapProductPreset("farmhouse", "farm-grid"), "classic");
    assert.equal(mapProductPreset("market", "dense"), "compact");
    assert.equal(mapProductPreset("artisan", "editorial"), "editorial");
  });

  it("maps template-specific category presets", () => {
    assert.equal(mapCategoryPreset("market", "shop-cards"), "tiles");
    assert.equal(mapCategoryPreset("farmhouse", "produce-tiles"), "tiles");
  });

  it("provides default presets per template", () => {
    assert.equal(defaultHeroPreset("farmhouse"), "farm-landscape");
    assert.equal(defaultHeroPreset("market"), "shop-first");
    assert.equal(defaultProductPreset("market"), "shop-grid");
  });
});

describe("studio template registry", () => {
  it("defines three templates with distinct header/footer variants", () => {
    assert.equal(Object.keys(STUDIO_TEMPLATES).length, 3);
    const headers = new Set(Object.values(STUDIO_TEMPLATES).map((t) => t.headerVariant));
    assert.equal(headers.size, 3);
  });

  it("includes preset maps for each template", () => {
    for (const id of ["artisan", "farmhouse", "market"] as const) {
      const maps = templatePresetMaps(id);
      assert.ok(maps.hero.length >= 4);
      assert.ok(maps.products.length >= 4);
      assert.ok(maps.defaults.hero);
    }
  });
});

describe("studio public context", () => {
  it("returns inactive when no websiteStudio nodes", async () => {
    const ctx = {
      storefront: { isPublished: false, draftConfig: {}, publishedConfig: null },
      businessMode: "FOOD_BUSINESS" as const,
    };
    const result = await resolveStudioPublicContext(ctx as never, true);
    assert.equal(result.active, false);
  });

  it("shop page title varies by template", () => {
    assert.equal(shopPageTitle("farmhouse"), "What's available");
    assert.equal(shopPageTitle("market"), "Shop");
  });
});

describe("custom pages", () => {
  it("validates page slugs", () => {
    assert.equal(isValidPageSlug("wholesale"), true);
    assert.equal(isValidPageSlug("shop"), false);
    assert.equal(isValidPageSlug(""), false);
  });

  it("seeds builtin about, contact, blog, and policy pages", () => {
    const pages = ensureCustomPages({});
    assert.equal(pages.length, 7);
    assert.ok(pages.some((p) => p.builtinKey === "about"));
    assert.ok(pages.some((p) => p.builtinKey === "blog"));
    assert.ok(pages.some((p) => p.builtinKey === "privacy"));
    assert.ok(pages.some((p) => p.showInFooter && !p.showInNav && p.builtinKey === "terms"));
  });

  it("merges missing policy pages into existing config", () => {
    const existing = ensureCustomPages({}).filter((p) => p.builtinKey !== "privacy");
    const raw = mergeCustomPagesIntoRaw({}, existing);
    assert.equal(customPagesNeedSync(raw), true);
    const merged = ensureCustomPages(raw);
    assert.ok(merged.some((p) => p.builtinKey === "privacy"));
  });

  it("lists visible blog posts by status", () => {
    const posts = [
      newBlogPost({ title: "Draft", slug: "draft-post" }),
      { ...newBlogPost({ title: "Live", slug: "live-post" }), status: "published" as const, publishedAt: new Date().toISOString() },
    ];
    assert.equal(listVisibleBlogPosts(posts, false).length, 1);
    assert.equal(listVisibleBlogPosts(posts, true).length, 2);
  });

  it("validates blog slugs", () => {
    assert.equal(isValidBlogSlug("my-post"), true);
    assert.equal(isValidBlogSlug("blog"), false);
    assert.equal(isValidBlogSlug("shop"), false);
  });

  it("defaults blog settings", () => {
    assert.equal(ensureBlogSettings({}).enabled, true);
    assert.equal(ensureBlogSettings({}).navSortOrder, 25);
    assert.equal(extractBlogPosts({}).length, 0);
  });

  it("merges blog into header nav order", () => {
    const pages = ensureCustomPages({});
    const blog = { ...defaultBlogSettings(), showInNav: true, navSortOrder: 15 };
    const nav = buildStudioHeaderNav(pages, blog, "demo-shop");
    assert.ok(nav.some((n) => n.slug === "blog"));
    assert.ok(nav.some((n) => n.slug === "about"));
  });

  it("resolves seo overrides with defaults", () => {
    const resolved = resolveSeoFields(
      { title: "Default title", description: "Default description" },
      { seoTitle: "Custom title", robots: "noindex" },
    );
    assert.equal(resolved.title, "Custom title");
    assert.equal(resolved.robots, "noindex");
    assert.equal(seoRobotsIndex(resolved.robots, true), false);
  });

  it("builds breadcrumb trail with home link", () => {
    const trail = buildStorefrontBreadcrumbs("demo-shop", [
      { label: "Demo Shop", path: "/" },
      { label: "Shop", path: "/shop" },
      { label: "Sourdough" },
    ]);
    assert.equal(trail.length, 3);
    assert.ok(trail[0].href?.includes("/shop/demo-shop"));
    assert.equal(trail[2].href, undefined);
  });

  it("stores page nodes separately from homepage", () => {
    const homeNodes = {
      ROOT: {
        type: { resolvedName: "CraftPageRoot" },
        isCanvas: true,
        props: {},
        displayName: "CraftPageRoot",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
    } as unknown as import("@craftjs/core").SerializedNodes;
    const pageNodes = {
      ROOT: {
        type: { resolvedName: "CraftPageRoot" },
        isCanvas: true,
        props: {},
        displayName: "CraftPageRoot",
        custom: {},
        hidden: false,
        nodes: ["t"],
        linkedNodes: {},
        parent: null,
      },
      t: {
        type: { resolvedName: "CraftTextSection" },
        isCanvas: false,
        props: {},
        displayName: "CraftTextSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: "ROOT",
      },
    } as unknown as import("@craftjs/core").SerializedNodes;

    const merged = mergeWebsiteStudioPageIntoRaw({}, "artisan", "page-1", pageNodes);
    const ws = extractWebsiteStudio(merged);
    assert.ok(ws?.pageNodes?.["page-1"]);
    const mergedHome = mergeWebsiteStudioIntoRaw(merged, "artisan", homeNodes);
    const ws2 = extractWebsiteStudio(mergedHome);
    assert.ok(ws2?.nodes);
    assert.ok(ws2?.pageNodes?.["page-1"]);
  });
});

describe("website studio storage", () => {
  it("extracts valid websiteStudio v2 payload", () => {
    const nodes = {
      ROOT: {
        type: { resolvedName: "CraftPageRoot" },
        isCanvas: true,
        props: {},
        displayName: "CraftPageRoot",
        custom: {},
        hidden: false,
        nodes: ["a"],
        linkedNodes: {},
      },
      a: {
        type: { resolvedName: "CraftHeroSection" },
        isCanvas: false,
        props: { headline: "Hi" },
        displayName: "CraftHeroSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    };
    const raw = {
      sections: [],
      websiteStudio: {
        version: 2,
        engine: "craft",
        templateId: "farmhouse",
        nodes,
      },
    };
    const studio = extractWebsiteStudio(raw);
    assert.ok(studio);
    assert.equal(studio?.templateId, "farmhouse");
    assert.equal(studio?.version, 2);
  });

  it("merges without removing legacy config or puck/craft spike", () => {
    const merged = mergeWebsiteStudioIntoRaw(
      { sections: [{ id: "hero" }], craftSpike: { version: 1 } },
      "artisan",
      {
        ROOT: {
          type: { resolvedName: "CraftPageRoot" },
          isCanvas: true,
          props: {},
          displayName: "CraftPageRoot",
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
          parent: null,
        },
      } as import("@craftjs/core").SerializedNodes,
    );
    const obj = merged as Record<string, unknown>;
    assert.ok(Array.isArray(obj.sections));
    assert.ok(obj.craftSpike);
    const ws = obj.websiteStudio as { templateId: string; version: number };
    assert.equal(ws.version, 2);
    assert.equal(ws.templateId, "artisan");
  });

  it("falls back from craftSpike v1 to studio read", () => {
    const nodes = {
      ROOT: {
        type: { resolvedName: "CraftPageRoot" },
        isCanvas: true,
        props: {},
        displayName: "CraftPageRoot",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    };
    const legacy = extractStudioFromDraft({
      craftSpike: { version: 1, engine: "craft", nodes },
    });
    assert.ok(legacy);
    assert.equal(legacy?.templateId, "artisan");
  });
});

describe("studio section registry", () => {
  it("blocks duplicate singleton sections", () => {
    const nodes = {
      x: { type: { resolvedName: "CraftHeroSection" } },
    };
    assert.equal(canInsertStudioSection(nodes, "CraftHeroSection", "FOOD_BUSINESS"), false);
    assert.equal(canInsertStudioSection({}, "CraftTextSection", "FOOD_BUSINESS"), true);
  });

  it("respects business mode for next drop", () => {
    assert.equal(canInsertStudioSection({}, "CraftNextDropSection", "FARM_STAND"), false);
    assert.equal(canInsertStudioSection({}, "CraftNextDropSection", "FOOD_BUSINESS"), true);
  });

  it("gates commerce-only and home-only sections by page kind", () => {
    assert.equal(
      canInsertStudioSection({}, "CraftProductDetailSection", "FOOD_BUSINESS"),
      false,
    );
    assert.equal(
      canInsertStudioSection({}, "CraftProductDetailSection", "FOOD_BUSINESS", "product"),
      true,
    );
    assert.equal(
      canInsertStudioSection({}, "CraftHeroSection", "FOOD_BUSINESS", "shop"),
      false,
    );
    assert.equal(
      canInsertStudioSection({}, "CraftHeroSection", "FOOD_BUSINESS"),
      true,
    );
  });
});

describe("commerce pages", () => {
  it("exposes stable commerce page keys", () => {
    assert.equal(commerceKeyForKind("shop"), "commerce-shop");
    assert.equal(commerceKeyForKind("product"), "commerce-product");
    assert.equal(commerceKindFromParam("category"), "category");
    assert.equal(commerceKindFromParam("nope"), null);
  });

  it("accepts product and menu detail section types", () => {
    const result = validateStudioNodes({
      p: {
        type: { resolvedName: "CraftProductDetailSection" },
        isCanvas: false,
        props: {},
        displayName: "CraftProductDetailSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
      m: {
        type: { resolvedName: "CraftMenuDetailSection" },
        isCanvas: false,
        props: {},
        displayName: "CraftMenuDetailSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
    } as import("@craftjs/core").SerializedNodes);
    assert.equal(result.ok, true);
  });
});

describe("storefront redirects", () => {
  it("normalizes paths and rejects shop-prefixed paths", () => {
    assert.equal(normalizeRedirectPath("/Product/Old/"), "/product/old");
    assert.equal(normalizeRedirectPath("product/x"), "/product/x");
    assert.equal(normalizeRedirectPath("/shop/demo/product/x"), null);
  });

  it("matches relative storefront paths", () => {
    assert.equal(
      storefrontRelativePath("/shop/demo/product/old", "demo"),
      "/product/old",
    );
    const hit = findStorefrontRedirect(
      [
        {
          id: "1",
          fromPath: "/product/old",
          toPath: "/product/new",
          code: 301,
          enabled: true,
        },
      ],
      "/product/old",
    );
    assert.equal(hit?.toPath, "/product/new");
    assert.equal(
      sanitizeRedirectInput({
        fromPath: "/product/a",
        toPath: "/product/a",
      }),
      null,
    );
  });
});

describe("studio validate-state", () => {
  it("rejects unknown component types", () => {
    const result = validateStudioNodes({
      bad: {
        type: { resolvedName: "EvilComponent" },
        isCanvas: false,
        props: {},
        displayName: "Evil",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
    } as import("@craftjs/core").SerializedNodes);
    assert.equal(result.ok, false);
  });

  it("accepts studio section types", () => {
    const result = validateStudioNodes({
      t: {
        type: { resolvedName: "CraftTextSection" },
        isCanvas: false,
        props: {},
        displayName: "CraftTextSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
      r: {
        type: { resolvedName: "CraftReviewsSection" },
        isCanvas: false,
        props: {},
        displayName: "CraftReviewsSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
      },
    } as import("@craftjs/core").SerializedNodes);
    assert.equal(result.ok, true);
  });
});

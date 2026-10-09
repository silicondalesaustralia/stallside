import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studioSectionLabel } from "@/lib/studio/section-registry";
import {
  SECTION_REGISTRY,
  VENDL_SECTION_TYPES,
  VENDL_TYPE_BY_CRAFT_NAME,
  vendlTypeForCraftName,
} from "@/lib/website/sections/registry";
import { validateSection } from "@/lib/website/sections/validate-section";
import type { SectionInstance, WebsiteDefinition } from "./definition";
import { hasErrors } from "./diagnostics";
import { validateWebsiteDefinition } from "./validate";

function section(overrides: Partial<SectionInstance> = {}): SectionInstance {
  return {
    id: "s1",
    type: "hero",
    schemaVersion: 1,
    variant: "background",
    visibility: "public",
    content: { headline: "Hello" },
    settings: {},
    ...overrides,
  };
}

function definition(sections: SectionInstance[]): WebsiteDefinition {
  return {
    schemaVersion: 1,
    template: { id: "test", version: 1 },
    theme: { skin: "market" },
    identity: {},
    navigation: { header: [], footer: [] },
    pages: {
      home: { id: "home", kind: "home", slug: "", title: "Home", enabled: true, layoutSource: "sections", sections },
    },
  };
}

describe("section registry", () => {
  it("maps every Craft section to a Vendl type with a definition", () => {
    for (const [craftName, type] of Object.entries(VENDL_TYPE_BY_CRAFT_NAME)) {
      assert.equal(SECTION_REGISTRY[type].craftName, craftName);
      assert.notEqual(studioSectionLabel(craftName), craftName, `${craftName} has an editor rule`);
    }
    assert.equal(VENDL_SECTION_TYPES.length, Object.keys(VENDL_TYPE_BY_CRAFT_NAME).length);
  });

  it("every default variant is an allowed variant", () => {
    for (const type of VENDL_SECTION_TYPES) {
      const def = SECTION_REGISTRY[type];
      assert.ok(def.variants.includes(def.defaultVariant), `${type} default variant`);
    }
  });

  it("does not resolve unknown Craft names", () => {
    assert.equal(vendlTypeForCraftName("CraftMysterySection"), undefined);
  });
});

describe("validateSection", () => {
  it("accepts a valid hero on the homepage", () => {
    assert.equal(hasErrors(validateSection(section(), "home", "s")), false);
  });

  it("rejects unknown types, bad variants and wrong page kinds", () => {
    assert.ok(hasErrors(validateSection(section({ type: "mystery" }), "home", "s")));
    assert.ok(hasErrors(validateSection(section({ variant: "nope" }), "home", "s")));
    assert.ok(hasErrors(validateSection(section({ type: "productDetail", variant: "default" }), "home", "s")));
  });

  it("rejects a section saved by a newer section version", () => {
    assert.ok(hasErrors(validateSection(section({ schemaVersion: 99 }), "home", "s")));
  });

  it("rejects unexpected content fields and over-long text", () => {
    assert.ok(hasErrors(validateSection(section({ content: { bogus: 1 } }), "home", "s")));
    assert.ok(hasErrors(validateSection(section({ content: { headline: "x".repeat(500) } }), "home", "s")));
  });

  it("enforces business mode only when one is given", () => {
    const farm = section({ type: "farmStand", variant: "default", content: {} });
    assert.equal(hasErrors(validateSection(farm, "home", "s")), false);
    assert.ok(hasErrors(validateSection(farm, "home", "s", "FOOD_BUSINESS")));
  });
});

describe("validateWebsiteDefinition", () => {
  it("accepts a minimal valid definition", () => {
    const result = validateWebsiteDefinition(definition([section()]));
    assert.ok(result.definition);
  });

  it("fails safely on a future schema version", () => {
    const result = validateWebsiteDefinition({ ...definition([]), schemaVersion: 2 });
    assert.equal(result.definition, undefined);
    assert.match(result.diagnostics[0].message, /newer Vendl version/);
  });

  it("rejects duplicate section ids and duplicate singletons", () => {
    const dupIds = validateWebsiteDefinition(definition([section(), section({ variant: "split" })]));
    assert.equal(dupIds.definition, undefined);
  });

  it("requires a public product detail on product pages with sections", () => {
    const def = definition([]);
    def.pages["commerce-product"] = {
      id: "commerce-product",
      kind: "product",
      slug: "product",
      title: "Product",
      enabled: true,
      layoutSource: "sections",
      sections: [section({ id: "t1", type: "text", variant: "default", content: { body: "Hi" } })],
    };
    assert.equal(validateWebsiteDefinition(def).definition, undefined);
  });
});

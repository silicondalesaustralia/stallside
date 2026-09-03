import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractCraftSpike,
  mergeCraftSpikeIntoRaw,
} from "./storage";
import { canInsertCraftSection } from "./section-registry";
import { validateCraftNodes } from "./validate-state";

describe("craft spike storage", () => {
  it("extracts valid craftSpike payload", () => {
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
    const raw = { sections: [], craftSpike: { version: 1, engine: "craft", nodes } };
    const spike = extractCraftSpike(raw);
    assert.ok(spike);
    assert.equal(spike?.engine, "craft");
  });

  it("merges without removing legacy config", () => {
    const merged = mergeCraftSpikeIntoRaw({ sections: [{ id: "hero" }] }, {
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
    } as import("@craftjs/core").SerializedNodes);
    const obj = merged as Record<string, unknown>;
    assert.ok(Array.isArray(obj.sections));
    assert.equal((obj.craftSpike as { engine: string }).engine, "craft");
  });
});

describe("craft section registry", () => {
  it("blocks duplicate singleton sections", () => {
    const nodes = {
      x: { type: { resolvedName: "CraftHeroSection" } },
    };
    assert.equal(canInsertCraftSection(nodes, "CraftHeroSection", "FOOD_BUSINESS"), false);
    assert.equal(canInsertCraftSection({}, "CraftProductGridSection", "FOOD_BUSINESS"), true);
  });
});

describe("craft validate-state", () => {
  it("rejects unknown component types", () => {
    const result = validateCraftNodes({
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
});

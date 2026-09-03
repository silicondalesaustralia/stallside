import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractPuckSpike,
  mergePuckSpikeIntoRaw,
  parseDraftConfigWithPuck,
} from "./spike-storage";
import { buildDefaultStorefrontConfig } from "@/lib/storefront/config";

describe("puck spike storage", () => {
  it("extracts valid puckSpike payload", () => {
    const home = { content: [{ type: "Hero", props: {} }], root: { props: {} } };
    const raw = {
      sections: [],
      pages: {},
      puckSpike: { version: 1, engine: "puck", home },
    };
    const spike = extractPuckSpike(raw);
    assert.equal(spike?.engine, "puck");
    assert.deepEqual(spike?.home, home);
  });

  it("rejects invalid puckSpike payload", () => {
    assert.equal(extractPuckSpike({ puckSpike: { version: 2 } }), undefined);
    assert.equal(extractPuckSpike(null), undefined);
  });

  it("merges puckSpike without removing legacy config", () => {
    const legacy = buildDefaultStorefrontConfig({
      businessMode: "FOOD_BUSINESS",
      fulfilmentIntents: ["pickup"],
    });
    const home = { content: [], root: { props: {} } };
    const merged = mergePuckSpikeIntoRaw(legacy, home) as {
      sections: unknown[];
      puckSpike: { engine: string };
    };
    assert.ok(Array.isArray(merged.sections));
    assert.equal(merged.puckSpike.engine, "puck");
  });

  it("parseDraftConfigWithPuck preserves legacy + puck", () => {
    const legacy = buildDefaultStorefrontConfig({
      businessMode: "FARM_STAND",
      fulfilmentIntents: ["pickup"],
    });
    const home = { content: [], root: { props: {} } };
    const raw = { ...legacy, puckSpike: { version: 1, engine: "puck", home } };
    const parsed = parseDraftConfigWithPuck(raw);
    assert.ok(parsed.sections.length > 0);
    assert.equal(parsed.puckSpike?.engine, "puck");
  });
});

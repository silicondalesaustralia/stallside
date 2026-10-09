import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canReuseScaffoldPlan,
  extractWebsiteAiScaffold,
  WEBSITE_AI_SCAFFOLD_VERSION,
  type WebsiteAiScaffold,
} from "./scaffold-storage";

function scaffold(extra: Partial<WebsiteAiScaffold> = {}): WebsiteAiScaffold {
  return {
    version: WEBSITE_AI_SCAFFOLD_VERSION,
    plan: { version: 1 } as WebsiteAiScaffold["plan"],
    intent: {},
    looks: [{ id: "look" } as WebsiteAiScaffold["looks"][number]],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...extra,
  };
}

describe("canReuseScaffoldPlan", () => {
  it("reuses the plan while the starting style matches", () => {
    assert.equal(canReuseScaffoldPlan(scaffold({ plannedBlueprintId: "local" }), "local"), true);
  });

  it("plans again for a different style or an old scaffold", () => {
    assert.equal(canReuseScaffoldPlan(scaffold({ plannedBlueprintId: "local" }), "editorial"), false);
    assert.equal(canReuseScaffoldPlan(scaffold(), "local"), false);
  });

  it("round-trips the planning metadata", () => {
    const stored = scaffold({ plannedBlueprintId: "local", provider: "heuristic", model: "v1" });
    const read = extractWebsiteAiScaffold({ websiteAiScaffold: stored });
    assert.equal(read?.plannedBlueprintId, "local");
    assert.equal(read?.provider, "heuristic");
  });
});

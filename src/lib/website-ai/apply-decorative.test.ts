import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyDecorativeImagesToPlan } from "./apply-decorative";
import type { AISitePlan } from "./types";

describe("applyDecorativeImagesToPlan", () => {
  it("sets hero decorative props and story imageUrl", () => {
    const plan: AISitePlan = {
      version: 1,
      designSystem: "farmhouse",
      siteStrategy: {
        primaryGoal: "farm-stand",
        audienceSummary: "Local",
        contentPriorities: [],
      },
      navigation: [{ label: "Home", pageType: "HOME" }],
      pages: [
        {
          pageType: "HOME",
          title: "Home",
          sections: [
            { id: "hero", type: "Hero", headline: "Hi" },
            { id: "story", type: "ImageText", heading: "Story", body: "Tell…" },
            { id: "t", type: "Text", body: "x" },
            { id: "t2", type: "Text", body: "x" },
            { id: "t3", type: "Text", body: "x" },
          ],
        },
      ],
    };
    const next = applyDecorativeImagesToPlan(plan, {
      heroUrl: "https://blob.example/hero.png",
      storyUrl: "https://blob.example/story.png",
      heroAlt: "Soft light",
      storyAlt: "Quiet space",
    });
    const home = next.pages[0]!;
    const hero = home.sections.find((s) => s.type === "Hero")!;
    const story = home.sections.find((s) => s.type === "ImageText")!;
    assert.equal(hero.placeholderKind, "IMAGE_DECORATIVE");
    assert.equal(hero.props?.decorativeImageUrl, "https://blob.example/hero.png");
    assert.equal(story.props?.imageUrl, "https://blob.example/story.png");
  });
});

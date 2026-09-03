import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildStarterHome, sanitiseEditorHome } from "./starter-home";

describe("starter-home", () => {
  it("builds food business starter without duplicate singletons", () => {
    const home = buildStarterHome({
      businessMode: "FOOD_BUSINESS",
      headline: "Jackos Buns",
      subheadline: "Fresh baking",
      about: "We bake daily.",
    });
    const menuCount = home.content.filter((b) => b.type === "UpcomingMenus").length;
    const heroCount = home.content.filter((b) => b.type === "Hero").length;
    assert.equal(menuCount, 1);
    assert.equal(heroCount, 1);
    assert.equal(home.content[0]?.type, "Hero");
  });

  it("sanitises duplicate singleton sections from polluted drafts", () => {
    const starter = buildStarterHome({
      businessMode: "FOOD_BUSINESS",
      headline: "Test",
      subheadline: null,
      about: null,
    });
    const polluted = {
      content: [
        { type: "Hero", props: {} },
        { type: "UpcomingMenus", props: {} },
        { type: "UpcomingMenus", props: {} },
        { type: "About", props: {} },
      ],
      root: { props: {} },
    };
    const cleaned = sanitiseEditorHome(polluted, starter);
    assert.equal(
      cleaned.content.filter((b) => b.type === "UpcomingMenus").length,
      1,
    );
  });
});

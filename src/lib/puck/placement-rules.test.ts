import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canInsertSection,
  availableSections,
  countSectionType,
} from "./section-registry";
import {
  insertSectionItem,
  moveSection,
  removeSectionAt,
  normaliseSingletons,
  validateInsert,
} from "./puck-mutations";

const emptyHome = { content: [], root: { props: {} } };

describe("section placement rules", () => {
  it("blocks duplicate singleton Hero", () => {
    const content = [{ type: "Hero", props: {} }];
    assert.equal(canInsertSection(content, "Hero", "FOOD_BUSINESS"), false);
    assert.equal(canInsertSection(content, "Text", "FOOD_BUSINESS"), true);
  });

  it("blocks duplicate UpcomingMenus for food business", () => {
    const content = [{ type: "UpcomingMenus", props: {} }];
    assert.equal(
      canInsertSection(content, "UpcomingMenus", "FOOD_BUSINESS"),
      false,
    );
  });

  it("hides UpcomingMenus from farm stand recommendations", () => {
    const available = availableSections([], "FARM_STAND");
    assert.equal(
      available.some((s) => s.type === "UpcomingMenus"),
      false,
    );
  });

  it("normalises duplicate singletons on load", () => {
    const data = {
      content: [
        { type: "Hero", props: { id: "1" } },
        { type: "Hero", props: { id: "2" } },
        { type: "Text", props: { id: "3" } },
      ],
      root: { props: {} },
    };
    const next = normaliseSingletons(data);
    assert.equal(countSectionType(next.content, "Hero"), 1);
    assert.equal(next.content.length, 2);
  });
});

describe("puck state mutations", () => {
  it("inserts a section at index", () => {
    const next = insertSectionItem(emptyHome, "Text", 0);
    assert.ok(next);
    assert.equal(next.content.length, 1);
    assert.equal(next.content[0].type, "Text");
  });

  it("moves sections", () => {
    let data = insertSectionItem(emptyHome, "Hero", 0)!;
    data = insertSectionItem(data, "Text", 1)!;
    const moved = moveSection(data, 0, 1);
    assert.equal(moved.content[0].type, "Text");
    assert.equal(moved.content[1].type, "Hero");
  });

  it("removes a section", () => {
    const data = insertSectionItem(emptyHome, "About", 0)!;
    const next = removeSectionAt(data, 0);
    assert.equal(next.content.length, 0);
  });

  it("validateInsert respects singleton rules", () => {
    const data = insertSectionItem(emptyHome, "About", 0)!;
    assert.equal(validateInsert(data, "About", "FOOD_BUSINESS"), false);
    assert.equal(validateInsert(data, "Text", "FOOD_BUSINESS"), true);
  });
});

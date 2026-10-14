import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SerializedNodes } from "@craftjs/core";
import { craftNodeToSection } from "@/lib/website/adapter/from-craft";
import { validateSection } from "@/lib/website/sections/validate-section";
import { FAQ_QUESTION_MAX, parseFaqItems, visibleFaqItems } from "@/lib/studio/faq-items";

function faqNode(props: Record<string, unknown>): SerializedNodes[string] {
  return {
    type: { resolvedName: "CraftFaqSection" },
    isCanvas: false,
    props,
    displayName: "CraftFaqSection",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: "ROOT",
  };
}

const items = [
  { id: "q1", question: "When can I collect?", answer: "Any day, **8am–6pm**." },
  { id: "q2", question: "", answer: "Draft answer" },
];

describe("FAQ section", () => {
  it("splits props into content and settings with nothing left over", () => {
    const { section, diagnostics } = craftNodeToSection(
      "faq1",
      faqNode({ heading: "FAQ", intro: "", items, startOpen: true }),
      "pages.0.sections.0",
    );
    assert.equal(section.type, "faq");
    assert.deepEqual(section.content.items, items);
    assert.equal(section.settings.startOpen, true);
    assert.equal(section.extras, undefined);
    assert.deepEqual(diagnostics, []);
    assert.deepEqual(validateSection(section, "content", "s"), []);
  });

  it("rejects a question over the limit", () => {
    const long = [{ id: "q1", question: "x".repeat(FAQ_QUESTION_MAX + 1), answer: "" }];
    const { section } = craftNodeToSection("faq1", faqNode({ items: long }), "s");
    assert.equal(validateSection(section, "content", "s").length, 1);
  });

  it("parses safely and hides questions with no text", () => {
    assert.deepEqual(parseFaqItems("nope"), []);
    assert.deepEqual(parseFaqItems([{ id: "q1" }]), []);
    assert.deepEqual(
      visibleFaqItems(parseFaqItems(items)).map((i) => i.id),
      ["q1"],
    );
  });
});

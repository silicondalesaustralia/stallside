import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SerializedNodes } from "@craftjs/core";
import { craftNodeToSection } from "@/lib/website/adapter/from-craft";
import { validateSection } from "@/lib/website/sections/validate-section";
import { CONTACT_MIN_FILL_MS, CONTACT_TRAP_FIELD, contactEnquiryEmail, looksLikeBot, parseContactEnquiry } from "@/lib/studio/contact-form";

function node(props: Record<string, unknown>): SerializedNodes[string] {
  return {
    type: { resolvedName: "CraftContactFormSection" },
    isCanvas: false,
    props,
    displayName: "CraftContactFormSection",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: "ROOT",
  };
}

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("contact form section", () => {
  it("validates as a section on content pages and the contact page", () => {
    const props = { heading: "Get in touch", body: "Ask us **anything**", buttonLabel: "Send", layout: "split", showPhone: false };
    const { section, diagnostics } = craftNodeToSection("c1", node(props), "pages.0.sections.0");
    assert.equal(section.type, "contactForm");
    assert.equal(section.variant, "split");
    assert.equal(section.settings.showPhone, false);
    assert.equal(section.extras, undefined);
    assert.deepEqual(diagnostics, []);
    assert.deepEqual(validateSection(section, "content", "s"), []);
  });

  it("requires a name, a valid email and a message", () => {
    assert.equal(parseContactEnquiry(form({ email: "a@b.co", message: "Hi" })).ok, false);
    assert.equal(parseContactEnquiry(form({ name: "Al", email: "nope", message: "Hi" })).ok, false);
    assert.equal(parseContactEnquiry(form({ name: "Al", email: "a@b.co", message: "" })).ok, false);
    const ok = parseContactEnquiry(form({ name: " Al ", email: "A@B.co", message: "Do you deliver?" }));
    assert.ok(ok.ok && ok.enquiry.name === "Al" && ok.enquiry.email === "a@b.co");
  });

  it("flags filled honeypots and instant submits", () => {
    const now = 1_000_000;
    const human = { startedAt: String(now - CONTACT_MIN_FILL_MS - 1) };
    assert.equal(looksLikeBot(form(human), now), false);
    assert.equal(looksLikeBot(form({ ...human, [CONTACT_TRAP_FIELD]: "Spam Inc" }), now), true);
    assert.equal(looksLikeBot(form({ ...human, company: "Autofilled Pty Ltd" }), now), false, "autofill doesn't trip the trap");
    assert.equal(looksLikeBot(form({ startedAt: String(now - 100) }), now), true);
    assert.equal(looksLikeBot(form({ startedAt: "garbage" }), now), true);
    assert.equal(looksLikeBot(form({}), now), false, "no-JS submits still go through");
  });

  it("escapes customer text in the owner email", () => {
    const { html, subject } = contactEnquiryEmail({
      shopName: "Egg Stand",
      pageUrl: "",
      enquiry: { name: "<b>x</b>", email: "a@b.co", phone: "", message: "<script>1</script>" },
    });
    assert.ok(!html.includes("<script>") && html.includes("&lt;script&gt;"));
    assert.ok(subject.includes("Egg Stand"));
  });
});

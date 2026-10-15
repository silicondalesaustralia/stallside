import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { editorPageUrl } from "@/lib/studio/editor-page-url";

const draft = (path: string) => `https://vendl.app/shop/eggs${path}?draft=1`;

describe("editorPageUrl", () => {
  it("opens the draft while the site is unpublished", () => {
    assert.equal(editorPageUrl({ isPublished: false, liveUrl: "https://eggs.vendl.app", viewPreviewUrl: draft("/about") }), draft("/about"));
  });

  it("opens the same page on the live site once published", () => {
    const live = "https://eggs.vendl.app/";
    assert.equal(editorPageUrl({ isPublished: true, liveUrl: live, viewPreviewUrl: draft("/products/dozen") }), "https://eggs.vendl.app/products/dozen");
    assert.equal(editorPageUrl({ isPublished: true, liveUrl: live, viewPreviewUrl: draft("/studio-preview") }), "https://eggs.vendl.app");
  });
});

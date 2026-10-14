import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SerializedNodes } from "@craftjs/core";
import { craftNodeToSection } from "@/lib/website/adapter/from-craft";
import { validateSection } from "@/lib/website/sections/validate-section";
import { DEFAULT_INFO_ROWS, INFO_ROWS_MAX, productDetailView } from "@/lib/studio/product-detail-settings";
import {
  PRODUCT_PHOTOS_MAX,
  isPhotoReorder,
  moveGalleryImage,
  productImageList,
  splitProductPhotos,
} from "@/lib/product-images";

function detailNode(props: Record<string, unknown>): SerializedNodes[string] {
  return {
    type: { resolvedName: "CraftProductDetailSection" },
    isCanvas: false,
    props,
    displayName: "CraftProductDetailSection",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: "ROOT",
  };
}

const tabs = [{ id: "t1", title: "Storage", body: "Keep cool." }];

describe("product detail section", () => {
  it("splits layout settings and info content with nothing left over", () => {
    const { section, diagnostics } = craftNodeToSection(
      "pd1",
      detailNode({
        showBackLink: true,
        showReviews: false,
        layout: "gallery",
        imageRatio: "portrait",
        imageSide: "right",
        enlarge: true,
        stickyCart: false,
        infoRows: DEFAULT_INFO_ROWS,
        tabs,
      }),
      "pages.0.sections.0",
    );
    assert.equal(section.type, "productDetail");
    assert.equal(section.settings.layout, "gallery");
    assert.deepEqual(section.content.tabs, tabs);
    assert.equal(section.extras, undefined);
    assert.deepEqual(diagnostics, []);
    assert.deepEqual(validateSection(section, "product", "s"), []);
  });

  it("rejects an unknown layout and too many info lines", () => {
    const rows = Array.from({ length: INFO_ROWS_MAX + 1 }, (_, i) => ({ id: `r${i}`, icon: "info", text: "x" }));
    const { section } = craftNodeToSection("pd1", detailNode({ layout: "carousel", infoRows: rows }), "s");
    assert.equal(validateSection(section, "product", "s").length, 2);
  });

  it("keeps the original single-column look for pages saved before layouts", () => {
    const view = productDetailView({ showBackLink: true, showReviews: true });
    assert.equal(view.layout, "simple");
    assert.equal(view.imageRatio, "square");
    assert.equal(view.enlarge, true);
    assert.equal(view.stickyCart, true);
    assert.deepEqual(view.infoRows, []);
  });

  it("hides blank info lines and untitled tabs", () => {
    const view = productDetailView({
      infoRows: [...DEFAULT_INFO_ROWS, { id: "blank", icon: "info", text: "  " }],
      tabs: [...tabs, { id: "t2", title: "", body: "orphan" }],
    });
    assert.equal(view.infoRows.length, DEFAULT_INFO_ROWS.length);
    assert.deepEqual(view.tabs.map((t) => t.id), ["t1"]);
  });
});

describe("product photos", () => {
  it("puts the main photo first and drops blanks, repeats and extras over the limit", () => {
    const extra = Array.from({ length: 10 }, (_, i) => `https://x/${i}.jpg`);
    assert.deepEqual(productImageList("https://x/main.jpg", ["", "https://x/main.jpg", "https://x/a.jpg"]), [
      "https://x/main.jpg",
      "https://x/a.jpg",
    ]);
    assert.equal(productImageList(null, extra).length, PRODUCT_PHOTOS_MAX);
    assert.deepEqual(productImageList(null, null), []);
  });

  it("moves an extra photo and ignores moves past either end", () => {
    const list = ["a", "b", "c"];
    assert.deepEqual(moveGalleryImage(list, "b", -1), ["b", "a", "c"]);
    assert.deepEqual(moveGalleryImage(list, "c", 1), list);
    assert.deepEqual(moveGalleryImage(list, "zzz", 1), list);
  });

  it("splits photos back into main + extras and only accepts true reorders", () => {
    assert.deepEqual(splitProductPhotos(["a", "b", "c"]), { imageUrl: "a", galleryImageUrls: ["b", "c"] });
    assert.deepEqual(splitProductPhotos([]), { imageUrl: null, galleryImageUrls: [] });
    assert.equal(isPhotoReorder(["a", "b"], ["b", "a"]), true);
    assert.equal(isPhotoReorder(["a", "b"], ["a", "x"]), false);
    assert.equal(isPhotoReorder(["a", "b"], ["a", "a"]), false);
    assert.equal(isPhotoReorder(["a", "b"], ["a"]), false);
  });
});

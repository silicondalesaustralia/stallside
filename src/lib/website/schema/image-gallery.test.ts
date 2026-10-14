import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GALLERY_MAX_IMAGES, parseGalleryImages, parseImageAspect, parseImageDisplay } from "@/lib/studio/gallery-images";
import { SECTION_REGISTRY } from "@/lib/website/sections/registry";

describe("image section gallery and slider", () => {
  it("defaults old sections to one image", () => {
    assert.equal(parseImageDisplay(undefined), "single");
    assert.equal(parseImageDisplay("slider"), "slider");
    assert.equal(parseImageAspect("weird"), "landscape");
  });

  it("keeps valid images only, up to the limit", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ url: `/img/${i}.jpg` }));
    assert.equal(parseGalleryImages(many).length, GALLERY_MAX_IMAGES);
    assert.deepEqual(parseGalleryImages([{ url: "javascript:x" }, { url: "" }, { url: "https://x.co/a.jpg", alt: "Eggs" }, "nope"]), [
      { url: "https://x.co/a.jpg", alt: "Eggs" },
    ]);
    assert.deepEqual(parseGalleryImages(null), []);
  });

  it("validates the new props on the section", () => {
    const content = SECTION_REGISTRY.image.content.partial();
    const settings = SECTION_REGISTRY.image.settings.partial();
    assert.equal(content.safeParse({ images: [{ url: "/a.jpg" }] }).success, true);
    assert.equal(content.safeParse({ images: [{ url: "ftp://a" }] }).success, false);
    assert.equal(settings.safeParse({ display: "gallery", columns: 4, aspect: "square", autoplay: true }).success, true);
    assert.equal(settings.safeParse({ columns: 5 }).success, false);
  });
});

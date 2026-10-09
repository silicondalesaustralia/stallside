import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { snapshotForRestore } from "./restore-snapshot";

describe("restore publication as draft", () => {
  const snapshot = {
    themePreset: "old",
    blogPosts: [{ id: "deleted-since" }],
    storefrontRedirects: [{ id: "old-redirect" }],
  };

  it("restores site content but keeps current blog posts and redirects", () => {
    const current = {
      themePreset: "new",
      blogPosts: [{ id: "written-since" }],
      blogTopics: [{ id: "t1" }],
      storefrontRedirects: [{ id: "new-redirect" }],
    };
    const restored = snapshotForRestore(snapshot, current);
    assert.equal(restored.themePreset, "old");
    assert.deepEqual(restored.blogPosts, [{ id: "written-since" }]);
    assert.deepEqual(restored.blogTopics, [{ id: "t1" }]);
    assert.deepEqual(restored.storefrontRedirects, [{ id: "new-redirect" }]);
  });

  it("does not resurrect blog posts or redirects the current draft no longer has", () => {
    const restored = snapshotForRestore(snapshot, { themePreset: "new" });
    assert.equal("blogPosts" in restored, false);
    assert.equal("storefrontRedirects" in restored, false);
  });
});

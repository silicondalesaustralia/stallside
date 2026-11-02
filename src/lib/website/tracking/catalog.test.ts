import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TAG_ITEMS, tagItemBySlug, tagItemStatus, tagItemValue } from "./catalog";
import { TRACKING_ID_KEYS, DEFAULT_STOREFRONT_TRACKING, type StorefrontTracking } from "./types";

const withIds = (ids: StorefrontTracking["ids"]): StorefrontTracking => ({ ...DEFAULT_STOREFRONT_TRACKING, ids });

describe("tag catalog", () => {
  it("covers every tracking ID exactly once with unique slugs", () => {
    const keys = TAG_ITEMS.flatMap((item) => item.keys);
    assert.deepEqual([...keys].sort(), [...TRACKING_ID_KEYS].sort());
    assert.equal(new Set(TAG_ITEMS.map((i) => i.slug)).size, TAG_ITEMS.length);
  });

  it("reports live, pending, removing and off", () => {
    const meta = tagItemBySlug("meta-pixel")!;
    const a = withIds({ metaPixelId: "123456789012345" });
    const b = withIds({ metaPixelId: "999999999999999" });
    const none = withIds({});
    assert.equal(tagItemStatus(meta, a, a), "live");
    assert.equal(tagItemStatus(meta, b, a), "pending");
    assert.equal(tagItemStatus(meta, none, a), "removing");
    assert.equal(tagItemStatus(meta, none, none), "off");
  });

  it("treats a Google Ads label change as pending", () => {
    const ads = tagItemBySlug("google-ads")!;
    const live = withIds({ googleAdsId: "AW-123456789" });
    const draft = withIds({ googleAdsId: "AW-123456789", googleAdsPurchaseLabel: "AbCdEf" });
    assert.equal(tagItemStatus(ads, draft, live), "pending");
  });

  it("summarises consent and custom code", () => {
    const consent = tagItemBySlug("cookie-consent")!;
    const custom = tagItemBySlug("custom-code")!;
    const draft = { ...DEFAULT_STOREFRONT_TRACKING, consentMode: "all" as const, customHead: "<meta name=a content=b>" };
    assert.equal(tagItemValue(consent, draft), "Every visitor");
    assert.equal(tagItemValue(custom, draft), "Added");
    assert.equal(tagItemStatus(consent, draft, DEFAULT_STOREFRONT_TRACKING), "pending");
  });
});

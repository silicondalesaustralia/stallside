import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "crypto";
import { hashEmail, hashPhone } from "./send-common";
import { applySecretsUpdate, readTrackingSecrets, trackingSecretsStatus } from "../secrets";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

describe("conversion hashing", () => {
  it("normalises email before hashing", () => {
    assert.equal(hashEmail("  Jo@Example.COM "), sha("jo@example.com"));
    assert.equal(hashEmail(""), undefined);
  });

  it("turns Australian local numbers into 61… before hashing", () => {
    assert.equal(hashPhone("0412 345 678"), sha("61412345678"));
    assert.equal(hashPhone("+61 412 345 678"), sha("61412345678"));
    assert.equal(hashPhone("123"), undefined);
  });
});

describe("tracking secrets", () => {
  it("encrypts tokens, keeps untouched ones and clears on request", () => {
    const first = applySecretsUpdate(null, {
      set: { metaCapiToken: "EAAB".padEnd(60, "x"), ga4ApiSecret: "secret_123456" },
      clear: [],
      testCodes: { metaTestEventCode: "TEST12345" },
    });
    assert.notEqual(first.metaCapiToken, "EAAB".padEnd(60, "x"));
    const second = applySecretsUpdate(first, { set: {}, clear: ["ga4ApiSecret"], testCodes: { metaTestEventCode: null } });
    const read = readTrackingSecrets(second);
    assert.equal(read.metaCapiToken, "EAAB".padEnd(60, "x"));
    assert.equal(read.ga4ApiSecret, undefined);
    assert.equal(read.metaTestEventCode, undefined);
    assert.deepEqual(trackingSecretsStatus(second).saved, { metaCapiToken: true, tiktokAccessToken: false, ga4ApiSecret: false });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { namecheapStorefrontHostParams, relativeHostName } from "./dns";

describe("relativeHostName", () => {
  it("strips the apex", () => {
    assert.equal(relativeHostName("_cf-custom-hostname.www.eggs.com.au", "eggs.com.au"), "_cf-custom-hostname.www");
    assert.equal(relativeHostName("_cf-custom-hostname.eggs.com.au.", "eggs.com.au"), "_cf-custom-hostname");
    assert.equal(relativeHostName("eggs.com.au", "eggs.com.au"), "@");
    assert.equal(relativeHostName("other.com", "eggs.com.au"), null);
  });
});

describe("namecheapStorefrontHostParams", () => {
  it("points www and the bare domain at the target, plus ownership TXT", () => {
    const p = namecheapStorefrontHostParams("Eggs.com.au", "customers.vendl.app.", [
      { name: "_cf-custom-hostname.eggs.com.au", value: "abc" },
      { name: "_cf-custom-hostname.elsewhere.com", value: "skip" },
    ]);
    assert.equal(p.SLD, "eggs");
    assert.equal(p.TLD, "com.au");
    assert.deepEqual(
      [p.HostName1, p.RecordType1, p.Address1],
      ["www", "CNAME", "customers.vendl.app"],
    );
    assert.deepEqual([p.HostName2, p.RecordType2, p.Address2], ["@", "ALIAS", "customers.vendl.app"]);
    assert.deepEqual([p.HostName3, p.RecordType3, p.Address3], ["_cf-custom-hostname", "TXT", "abc"]);
    assert.equal(p.HostName4, undefined);
  });
});

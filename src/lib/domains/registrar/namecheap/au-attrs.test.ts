import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { namecheapAuExtendedAttrs } from "./au-attrs";
import { auEntityTypeFor } from "../au-entity-types";

describe("namecheapAuExtendedAttrs", () => {
  it("sends registrant + eligibility attributes for .com.au", () => {
    const out = namecheapAuExtendedAttrs("com.au", {
      eligibilityType: "Sole Trader",
      eligibilityId: "51 824 753 556",
      eligibilityIdType: "ABN",
      eligibilityName: "Alexa's Eggs",
    });
    assert.deepEqual(out, {
      COMAURegistrantId: "51824753556",
      COMAURegistrantIdType: "ABN",
      eligibility_id: "51824753556",
      eligibility_type: "ABN",
      eligibility_name: "Alexa's Eggs",
      eligibility_entity_type: "Sole Trader",
    });
  });

  it("uses the NETAU prefix and skips other TLDs", () => {
    const au = { eligibilityType: "Company", eligibilityId: "123456789", eligibilityIdType: "ACN" };
    assert.equal(namecheapAuExtendedAttrs("net.au", au).NETAURegistrantIdType, "ACN");
    assert.deepEqual(namecheapAuExtendedAttrs("com", au), {});
  });
});

describe("auEntityTypeFor", () => {
  it("keeps the type consistent with the ID type", () => {
    assert.equal(auEntityTypeFor("ACN", "Sole Trader"), "Company");
    assert.equal(auEntityTypeFor("TM", "Company"), "Trademark Owner");
    assert.equal(auEntityTypeFor("TM", "Pending TM Owner"), "Pending TM Owner");
    assert.equal(auEntityTypeFor("ABN", "Partnership"), "Partnership");
    assert.equal(auEntityTypeFor("ABN", "Trademark Owner"), "Sole Trader");
    assert.equal(auEntityTypeFor("ABN", "nonsense"), "Sole Trader");
  });
});

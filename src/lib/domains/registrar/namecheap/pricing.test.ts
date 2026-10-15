import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { namecheapPriceFromXml } from "./pricing";

const XML = `<ApiResponse Status="OK"><CommandResponse><UserGetPricingResult>
<ProductType Name="domains"><ProductCategory Name="register">
<Product Name="co.uk"><Price Duration="1" DurationType="YEAR" Price="9.98" YourPrice="9.98" Currency="USD" /></Product>
<Product Name="com.au">
  <Price Duration="2" DurationType="YEAR" Price="33.96" RegularPrice="43.20" YourPrice="33.96" YourAdditonalCost="0" Currency="USD" />
  <Price Duration="1" DurationType="YEAR" Price="16.98" RegularPrice="21.60" YourPrice="16.98" YourAdditonalCost="0" Currency="USD" />
</Product>
<Product Name="com"><Price Duration="1" DurationType="YEAR" Price="10.28" RegularPrice="13.98" YourPrice="10.28" YourAdditonalCost="0.20" Currency="USD" /></Product>
</ProductCategory></ProductType></UserGetPricingResult></CommandResponse></ApiResponse>`;

describe("namecheapPriceFromXml", () => {
  it("uses this account's price for the exact TLD and duration", () => {
    assert.equal(namecheapPriceFromXml(XML, "com.au", 1)?.cost.value, 1698);
    assert.equal(namecheapPriceFromXml(XML, "com.au", 2)?.cost.value, 3396);
  });

  it("adds the ICANN fee and doesn't confuse com with com.au", () => {
    assert.equal(namecheapPriceFromXml(XML, "com", 1)?.cost.value, 1048);
  });

  it("reads the requested category when several are returned", () => {
    const both = XML.replace(
      `<ProductCategory Name="register">`,
      `<ProductCategory Name="renew"><Product Name="com.au"><Price Duration="1" DurationType="YEAR" YourPrice="27.10" Currency="USD" /></Product></ProductCategory><ProductCategory Name="register">`,
    );
    assert.equal(namecheapPriceFromXml(both, "com.au", 1, "REGISTER")?.cost.value, 1698);
    assert.equal(namecheapPriceFromXml(both, "com.au", 1, "RENEW")?.cost.value, 2710);
  });

  it("returns null instead of guessing", () => {
    assert.equal(namecheapPriceFromXml(XML, "net.au", 1), null);
    assert.equal(namecheapPriceFromXml(XML, "com", 3), null);
  });
});

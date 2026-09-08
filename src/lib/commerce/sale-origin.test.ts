import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SaleOrigin } from "@/generated/prisma/client";
import {
  isObservedExternalSale,
  saleOriginIncursVendlFee,
} from "@/lib/commerce/sale-origin";

describe("sale origin fee rules", () => {
  it("charges Vendl fee only on Vendl-originated sales", () => {
    assert.equal(saleOriginIncursVendlFee(SaleOrigin.VENDL_WEB), true);
    assert.equal(saleOriginIncursVendlFee(SaleOrigin.FARM_STAND), true);
    assert.equal(saleOriginIncursVendlFee(SaleOrigin.SQUARE_POS), false);
    assert.equal(saleOriginIncursVendlFee(SaleOrigin.MARKET), false);
    assert.equal(saleOriginIncursVendlFee(SaleOrigin.MANUAL), false);
  });

  it("marks POS as observed external GMV", () => {
    assert.equal(isObservedExternalSale(SaleOrigin.SQUARE_POS), true);
    assert.equal(isObservedExternalSale(SaleOrigin.VENDL_WEB), false);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { registrarPhone } from "./phone";

describe("registrarPhone", () => {
  it("turns what people type into +CC.NNNN", () => {
    assert.equal(registrarPhone("0412 345 678", "AU"), "+61.412345678");
    assert.equal(registrarPhone("+61 412 345 678", "AU"), "+61.412345678");
    assert.equal(registrarPhone("+61412345678", "au"), "+61.412345678");
    assert.equal(registrarPhone("+61.0412345678", "AU"), "+61.412345678");
    assert.equal(registrarPhone("0061 8 8388 0000", "AU"), "+61.883880000");
    assert.equal(registrarPhone("(08) 8388-0000", "AU"), "+61.883880000");
    assert.equal(registrarPhone("+64.211234567", "AU"), "+64.211234567");
  });

  it("rejects numbers it can't read", () => {
    assert.equal(registrarPhone("+61.", "AU"), null);
    assert.equal(registrarPhone("", "AU"), null);
    assert.equal(registrarPhone("call me", "AU"), null);
    assert.equal(registrarPhone("+44 20 7946 0000", "AU"), null);
    assert.equal(registrarPhone("0412345678", "ZZ"), null);
  });
});

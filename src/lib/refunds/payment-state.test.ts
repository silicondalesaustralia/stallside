import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateRefund, proportionalAppFee, type PaymentState } from "./payment-state";

const deposit: PaymentState = { id: "dep", amountCents: 2000, refundedCents: 0, appFeeCents: 60 };
const balance: PaymentState = { id: "bal", amountCents: 3000, refundedCents: 500, appFeeCents: 90 };

test("refunds the balance payment before the deposit", () => {
  const plan = allocateRefund([deposit, balance], 3000);
  assert.deepEqual(
    plan.map((s) => [s.payment.id, s.amountCents]),
    [["bal", 2500], ["dep", 500]],
  );
});

test("a refund within one payment touches only that payment", () => {
  const plan = allocateRefund([deposit], 1500);
  assert.deepEqual(plan.map((s) => [s.payment.id, s.amountCents]), [["dep", 1500]]);
});

test("fee share is proportional and never exceeds the original fee", () => {
  assert.equal(proportionalAppFee(deposit, 1000), 30);
  assert.equal(proportionalAppFee(deposit, 2000), 60);
  assert.equal(proportionalAppFee({ ...deposit, appFeeCents: 0 }, 1000), 0);
});

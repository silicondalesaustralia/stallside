"use server";

import { chargeOrderBalance } from "@/lib/deposit-order";

export async function retryBalanceCharge(orderId: string) {
  try {
    return await chargeOrderBalance(orderId);
  } catch (error) {
    console.error("retryBalanceCharge failed", error);
    return { ok: false as const, error: "Could not charge balance." };
  }
}

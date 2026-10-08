"use server";

import { chargeOrderBalance } from "@/lib/deposit-order";
import { verifyOrderAccessToken } from "@/lib/order-access-token";

export async function retryBalanceCharge(orderId: string, token: string) {
  if (!verifyOrderAccessToken(orderId, "balance", token)) {
    return { ok: false as const, error: "Invalid or missing link." };
  }
  try {
    return await chargeOrderBalance(orderId);
  } catch (error) {
    console.error("retryBalanceCharge failed", error);
    return { ok: false as const, error: "Could not charge balance." };
  }
}

export async function payBalanceWithSquareCard(orderId: string, token: string, sourceId: string) {
  if (!verifyOrderAccessToken(orderId, "balance", token)) {
    return { ok: false as const, error: "Invalid or missing link." };
  }
  try {
    return await chargeOrderBalance(orderId, sourceId);
  } catch (error) {
    console.error("payBalanceWithSquareCard failed", error);
    return { ok: false as const, error: "Could not charge balance." };
  }
}

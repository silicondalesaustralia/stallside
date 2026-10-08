"use server";

import { completeSquareSubscriptionSignup } from "@/lib/square-subscriptions/enrol-complete";

export async function completeSquareSubscriptionAction(input: {
  manageToken: string;
  sourceId: string;
}): Promise<{ ok: true } | { error: string }> {
  try {
    if (!input.manageToken || !input.sourceId) return { error: "Card details are missing." };
    return await completeSquareSubscriptionSignup(input);
  } catch (error) {
    console.error("Complete Square subscription failed", error);
    return { error: "Card payment failed. Try again." };
  }
}

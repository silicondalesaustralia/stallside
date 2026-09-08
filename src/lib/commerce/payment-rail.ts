import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  isSquarePaymentsEnabled,
  isSquareConnectEnabled,
} from "@/lib/square/config";

export type OnlineRail = "stripe" | "square" | "none";

export function resolveOnlinePaymentRail(input: {
  preferred: OnlinePaymentProvider | string | null | undefined;
  stripeReady: boolean;
  squareReady: boolean;
  standAcceptCard?: boolean;
  standAcceptSquare?: boolean;
}): OnlineRail {
  const preferred = input.preferred ?? OnlinePaymentProvider.STRIPE;

  if (preferred === OnlinePaymentProvider.SQUARE) {
    if (
      isSquarePaymentsEnabled() &&
      input.squareReady &&
      (input.standAcceptSquare ?? true)
    ) {
      return "square";
    }
    if (input.stripeReady && (input.standAcceptCard ?? true)) return "stripe";
    return "none";
  }

  if (input.stripeReady && (input.standAcceptCard ?? true)) return "stripe";
  if (
    isSquarePaymentsEnabled() &&
    input.squareReady &&
    (input.standAcceptSquare ?? true)
  ) {
    return "square";
  }
  return "none";
}

export function squareSettingsVisible(): boolean {
  return isSquareConnectEnabled();
}

"use client";

import { useEffect, useState } from "react";
import { squareEnvironment } from "@/lib/square/public-env";

export type SquarePayments = {
  paymentRequest: (options: {
    countryCode: string;
    currencyCode: string;
    total: { amount: string; label: string };
  }) => SquarePaymentRequest;
  card: () => Promise<SquareCard>;
  applePay: (req: SquarePaymentRequest) => Promise<SquareWalletMethod>;
  googlePay: (req: SquarePaymentRequest) => Promise<SquareWalletMethod>;
};

export type SquarePaymentRequest = object;

export type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string }>;
};

export type SquareWalletMethod = {
  tokenize: () => Promise<{ status: string; token?: string }>;
  attach?: (selector: string) => Promise<void>;
  destroy?: () => Promise<void>;
};

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => Promise<SquarePayments>;
    };
  }
}

function squareSdkUrl(): string {
  return squareEnvironment() === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}

/** Load Square Web Payments SDK once; returns ready flag. */
export function useSquareSdk(onLoadError: (message: string) => void): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Square) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = squareSdkUrl();
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => onLoadError("Could not load card payments.");
    document.body.appendChild(script);
  }, [onLoadError]);
  return ready;
}

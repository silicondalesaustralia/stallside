"use client";

import { useEffect, useState } from "react";
import { squareEnvironment } from "@/lib/square/public-env";

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            errors?: unknown;
          }>;
        }>;
      }>;
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useSquareSdk, type SquareCard } from "../use-square-sdk";

/** Mount a Square card field into `containerId`; returns the card once ready. */
export function useSquareCard(input: {
  applicationId: string;
  locationId: string;
  containerId: string;
  onError: (message: string) => void;
}): SquareCard | null {
  const { applicationId, locationId, containerId, onError } = input;
  const ready = useSquareSdk(onError);
  const [card, setCard] = useState<SquareCard | null>(null);
  const cardRef = useRef<SquareCard | null>(null);

  useEffect(() => {
    if (!ready || !window.Square) return;
    let cancelled = false;
    void (async () => {
      try {
        const payments = await window.Square!.payments(applicationId, locationId);
        const mounted = await payments.card();
        await mounted.attach(`#${containerId}`);
        if (cancelled) {
          await mounted.destroy?.();
          return;
        }
        cardRef.current = mounted;
        setCard(mounted);
      } catch {
        if (!cancelled) onError("Could not load the card form.");
      }
    })();
    return () => {
      cancelled = true;
      void cardRef.current?.destroy?.();
      cardRef.current = null;
    };
  }, [ready, applicationId, locationId, containerId, onError]);

  return card;
}

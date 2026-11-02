"use client";

import { useEffect } from "react";
import { emitStorefrontEvent, type StorefrontEvent } from "@/lib/website/tracking/events";

/** Sends one storefront event when rendered (e.g. purchase on the success page). */
export default function TrackStorefrontEvent({ event }: { event: StorefrontEvent }) {
  useEffect(() => {
    emitStorefrontEvent(event);
  }, [event]);
  return null;
}

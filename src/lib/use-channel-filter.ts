"use client";

import { useState } from "react";
import type { SalesChannel } from "@/lib/sales-series";

export type ChannelFilterMode = "all" | "channels";

export function useChannelFilter() {
  const [mode, setMode] = useState<ChannelFilterMode>("all");
  const [enabled, setEnabled] = useState<Record<SalesChannel, boolean>>({
    subscription: true,
    preorder: true,
    stand: true,
  });

  function toggleChannel(key: SalesChannel) {
    if (mode === "all") {
      setMode("channels");
      setEnabled({
        subscription: key === "subscription",
        preorder: key === "preorder",
        stand: key === "stand",
      });
      return;
    }
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.subscription && !next.preorder && !next.stand) {
        return { ...prev, [key]: true };
      }
      return next;
    });
  }

  return {
    mode,
    enabled,
    setAll: () => setMode("all"),
    toggleChannel,
  };
}

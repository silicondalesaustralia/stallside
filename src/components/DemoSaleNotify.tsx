"use client";

import { useEffect } from "react";
import { notifyDemoParentSale } from "@/lib/demo-sale-message";

/** Fires a demo sale alert when checkout success loads inside the /demo phone iframe. */
export default function DemoSaleNotify({
  standSlug,
  via = "card",
  totalCents,
  currency,
}: {
  standSlug: string | null;
  via?: "cash" | "local_transfer" | "card";
  totalCents?: number;
  currency?: string;
}) {
  useEffect(() => {
    if (!standSlug) return;
    notifyDemoParentSale({ standSlug, via, totalCents, currency });
  }, [standSlug, via, totalCents, currency]);

  return null;
}

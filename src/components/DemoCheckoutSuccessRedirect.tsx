"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DemoRegion } from "@/lib/demo";
import { storePendingDemoSale } from "@/lib/demo-sale-message";

/** After demo card payment, save the sale and return to the phone demo for the alert. */
export default function DemoCheckoutSuccessRedirect({
  region,
  standSlug,
  via = "card",
  totalCents,
  currency,
}: {
  region: DemoRegion;
  standSlug: string;
  via?: "cash" | "local_transfer" | "card";
  totalCents?: number;
  currency?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    storePendingDemoSale({ standSlug, via, totalCents, currency });
    const timer = setTimeout(() => {
      router.replace(`/demo/owner?region=${region}`);
    }, 1600);
    return () => clearTimeout(timer);
  }, [region, standSlug, via, totalCents, currency, router]);

  return (
    <p className="mt-4 text-center text-sm text-[var(--muted)]">
      Opening stall owner&apos;s phone…
    </p>
  );
}

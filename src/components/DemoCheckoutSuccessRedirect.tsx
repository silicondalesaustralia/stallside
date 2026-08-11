"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DemoProduct } from "@/lib/demo";
import { storePendingDemoSale } from "@/lib/demo-sale-message";

/** After demo card payment, save the sale and return to the phone demo for the alert. */
export default function DemoCheckoutSuccessRedirect({
  product,
  standSlug,
  via = "card",
  totalCents,
  currency,
}: {
  product: DemoProduct;
  standSlug: string;
  via?: "cash" | "local_transfer" | "card";
  totalCents?: number;
  currency?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    storePendingDemoSale({ standSlug, via, totalCents, currency });
    const timer = setTimeout(() => {
      router.replace(`/demo/owner?product=${product}`);
    }, 1600);
    return () => clearTimeout(timer);
  }, [product, standSlug, via, totalCents, currency, router]);

  return (
    <p className="mt-4 text-center text-sm text-[var(--muted)]">
      Opening stall owner&apos;s phone…
    </p>
  );
}

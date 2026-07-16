"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import type { DemoRegion } from "@/lib/demo";
import {
  DEMO_SALE_CHANNEL,
  isDemoSalePayload,
  storePendingDemoSale,
  type DemoSalePayload,
} from "@/lib/demo-sale-message";

export default function DemoPhoneCheckout({
  checkoutUrl,
  standName,
  standSlug,
  region,
}: {
  checkoutUrl: string;
  standName: string;
  standSlug: string;
  region: DemoRegion;
}) {
  const router = useRouter();

  const goToOwnerPhone = useCallback(
    (payload: DemoSalePayload) => {
      if (payload.standSlug !== standSlug) return;
      storePendingDemoSale({
        standSlug: payload.standSlug,
        via: payload.via,
        totalCents: payload.totalCents,
        currency: payload.currency,
        productSummary: payload.productSummary,
      });
      router.push(`/demo/owner?region=${region}`);
    },
    [standSlug, region, router],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isDemoSalePayload(event.data)) return;
      goToOwnerPhone(event.data);
    }
    window.addEventListener("message", onMessage);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(DEMO_SALE_CHANNEL);
      channel.onmessage = (event) => {
        if (isDemoSalePayload(event.data)) goToOwnerPhone(event.data);
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      window.removeEventListener("message", onMessage);
      channel?.close();
    };
  }, [goToOwnerPhone]);

  return (
    <div className="flex w-full flex-col">
      <ul className="list-disc space-y-2 pl-5 text-base leading-snug text-[var(--muted)]">
        <li>
          Checkout runs on the <strong className="font-semibold text-[var(--field)]">customer&apos;s phone</strong>{" "}
          below — pick items and pay as a shopper would at the stand.
        </li>
        <li>
          Apple Pay, Link, and Google Pay work live, but we can&apos;t show them
          in this demo.
        </li>
        <li>
          For card payments, use Stripe test card{" "}
          <span className="font-receipt text-[var(--ink)]">
            4242 4242 4242 4242
          </span>
          , any future expiry, and any CVC.
        </li>
        <li>
          After checkout you&apos;ll be taken to a separate{" "}
          <strong className="font-semibold text-[var(--field)]">stall owner&apos;s phone</strong>{" "}
          to see the sale alert.
        </li>
      </ul>

      <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col items-center gap-2">
        <p className="text-sm font-semibold tracking-tight text-[var(--field)]">
          Customer&apos;s phone
        </p>
        <DemoPhoneFrame>
          <iframe
            title={`${standName} checkout`}
            src={checkoutUrl}
            className="size-full border-0 bg-[var(--wash)]"
            allow="payment *"
          />
        </DemoPhoneFrame>
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Open full screen
        </a>
      </div>
    </div>
  );
}

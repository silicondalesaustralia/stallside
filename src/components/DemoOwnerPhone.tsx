"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import DemoOwnerPhoneScreen from "@/components/DemoOwnerPhoneScreen";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import DemoSaleBanner from "@/components/DemoSaleBanner";
import type { DemoRegion } from "@/lib/demo";
import {
  consumePendingDemoSale,
  DEMO_SALE_CHANNEL,
  isDemoSalePayload,
  type DemoSalePayload,
} from "@/lib/demo-sale-message";

export default function DemoOwnerPhone({
  region,
  standName,
  standSlug,
}: {
  region: DemoRegion;
  standName: string;
  standSlug: string;
}) {
  const [banner, setBanner] = useState<DemoSalePayload | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSale = useCallback(
    (payload: DemoSalePayload) => {
      if (payload.standSlug !== standSlug) return;
      if (revealTimer.current) clearTimeout(revealTimer.current);
      setBanner(payload);
      setBannerVisible(false);
      revealTimer.current = setTimeout(() => setBannerVisible(true), 500);
    },
    [standSlug],
  );

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  useEffect(() => {
    const pending = consumePendingDemoSale();
    if (pending && pending.standSlug === standSlug) {
      showSale({ type: "stallside:demo-sale", ...pending });
    }
  }, [standSlug, showSale]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isDemoSalePayload(event.data)) return;
      showSale(event.data);
    }
    window.addEventListener("message", onMessage);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(DEMO_SALE_CHANNEL);
      channel.onmessage = (event) => {
        if (isDemoSalePayload(event.data)) showSale(event.data);
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      window.removeEventListener("message", onMessage);
      channel?.close();
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [showSale]);

  return (
    <div className="flex w-full flex-col">
      <ul className="list-disc space-y-2 pl-5 text-base leading-snug text-[var(--muted)]">
        <li>
          This is the <strong className="font-semibold text-[var(--field)]">stall owner&apos;s phone</strong>{" "}
          — separate from the customer checkout you just completed.
        </li>
        <li>
          When a sale goes through, the owner gets a push-style alert like the
          one below.
        </li>
        <li>Dismiss the notification with ×, or try another sale from checkout.</li>
      </ul>

      <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col items-center gap-2">
        <p className="text-sm font-semibold tracking-tight text-[var(--field)]">
          Stall owner&apos;s phone
        </p>
        <DemoPhoneFrame
          notification={
            <DemoSaleBanner
              visible={bannerVisible}
              via={banner?.via ?? "cash"}
              totalCents={banner?.totalCents}
              currency={banner?.currency}
              standName={standName}
              onDismiss={dismissBanner}
            />
          }
        >
          <DemoOwnerPhoneScreen />
        </DemoPhoneFrame>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/demo/phone?region=${region}`}
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Try another sale
        </Link>
        <Link
          href={`/demo?region=${region}`}
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Back to QR sign
        </Link>
      </div>
    </div>
  );
}

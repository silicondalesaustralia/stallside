"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import DemoSaleBanner from "@/components/DemoSaleBanner";
import {
  consumePendingDemoSale,
  DEMO_SALE_CHANNEL,
  isDemoSalePayload,
  type DemoSalePayload,
} from "@/lib/demo-sale-message";

export default function DemoPhoneCheckout({
  checkoutUrl,
  standName,
  standSlug,
}: {
  checkoutUrl: string;
  standName: string;
  standSlug: string;
}) {
  const [banner, setBanner] = useState<DemoSalePayload | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSale = useCallback(
    (payload: DemoSalePayload) => {
      if (payload.standSlug !== standSlug) return;
      if (revealTimer.current) clearTimeout(revealTimer.current);
      setBanner(payload);
      setBannerVisible(false);
      revealTimer.current = setTimeout(() => setBannerVisible(true), 350);
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
    <div className="mx-auto flex w-full max-w-[320px] flex-col gap-4">
      <p className="text-sm leading-snug text-[var(--muted)]">
        On desktop, checkout opens in this phone. Complete a sale to see the
        owner alert.
      </p>
      <p className="text-sm leading-snug text-[var(--muted)]">
        Apple Pay, Link, and Google Pay work live, but we can&apos;t show them
        in demo. Use a Stripe test card instead —{" "}
        <span className="font-receipt text-[var(--ink)]">4242 4242 4242 4242</span>,
        any future expiry, and any CVC — to see how card payments work. Complete
        the full flow to see the notification sequence on completion.
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
        <iframe
          ref={iframeRef}
          title={`${standName} checkout`}
          src={checkoutUrl}
          className="size-full border-0 bg-[var(--wash)]"
          allow="payment *"
        />
      </DemoPhoneFrame>

      <a
        href={checkoutUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
      >
        Open full screen
      </a>
    </div>
  );
}

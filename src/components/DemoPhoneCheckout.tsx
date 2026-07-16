"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DemoPhoneFrame from "@/components/DemoPhoneFrame";
import DemoSaleBanner from "@/components/DemoSaleBanner";
import {
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
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState<DemoSalePayload | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showSale = useCallback((payload: DemoSalePayload) => {
    if (payload.standSlug !== standSlug) return;
    setBanner(payload);
    setBannerVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBannerVisible(false), 4500);
  }, [standSlug]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isDemoSalePayload(event.data)) return;
      showSale(event.data);
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showSale]);

  function onIframeLoad() {
    try {
      const path = iframeRef.current?.contentWindow?.location.pathname ?? "";
      if (path.startsWith("/checkout/success")) {
        showSale({
          type: "stallside:demo-sale",
          standSlug,
          via: "card",
        });
      }
    } catch {
      // Cross-origin (Stripe) — ignore until back on our domain
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)] sm:flex-none"
        >
          {open ? "Checkout open in phone" : "Open checkout"}
        </button>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)] lg:hidden"
        >
          Open full screen
        </a>
      </div>

      <div className={`${open ? "block" : "hidden lg:block"}`}>
        {!open ? (
          <p className="mb-3 hidden text-center text-sm text-[var(--muted)] lg:block">
            On desktop, checkout opens in this phone. Complete a cash sale to see
            the owner alert.
          </p>
        ) : null}
        <DemoPhoneFrame
          notification={
            <DemoSaleBanner
              visible={bannerVisible}
              via={banner?.via ?? "cash"}
              totalCents={banner?.totalCents}
              currency={banner?.currency}
              standName={standName}
            />
          }
        >
          {open ? (
            <iframe
              ref={iframeRef}
              title={`${standName} checkout`}
              src={checkoutUrl}
              className="size-full border-0 bg-[var(--wash)]"
              onLoad={onIframeLoad}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                Customer phone
              </p>
              <p className="text-sm text-[var(--muted)]">
                Tap Open checkout to load this stand inside the frame.
              </p>
            </div>
          )}
        </DemoPhoneFrame>
      </div>
    </div>
  );
}

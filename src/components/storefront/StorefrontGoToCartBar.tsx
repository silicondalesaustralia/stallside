"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { useCartHref } from "@/components/storefront/use-cart-href";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

export default function StorefrontGoToCartBar({
  standSlug,
  branding,
}: {
  standSlug: string;
  branding: ResolvedStorefrontBranding;
}) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);

  const count = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  const cartHref = useCartHref(standSlug);
  const desktop = branding.siteStyle.cartBarDesktop !== false;
  const mobile = branding.siteStyle.cartBarMobile !== false;
  if (count <= 0 || (!desktop && !mobile)) return null;

  const btnClass = storefrontButtonClass(branding);
  const visibility = desktop && mobile ? "" : desktop ? "hidden sf-md:block" : "sf-md:hidden";

  return (
    <div className={`${visibility} fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--panel)]/95 px-4 py-4 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]`}>
      <div className="mx-auto max-w-5xl">
        <Link
          href={cartHref}
          className={`flex w-full items-center justify-center gap-2 py-4 text-lg ${btnClass}`}
        >
          View cart
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-sm">
            {count}
          </span>
        </Link>
      </div>
    </div>
  );
}

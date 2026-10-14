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

export default function StandCartLink({ standSlug }: { standSlug: string }) {
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

  return (
    <Link
      href={cartHref}
      className="relative shrink-0 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold"
    >
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--leaf)] px-1.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

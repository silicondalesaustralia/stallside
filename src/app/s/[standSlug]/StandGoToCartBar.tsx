"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import {
  cartItemCount,
  getStandCartEpoch,
  readStandCartLines,
  subscribeStandCart,
} from "@/lib/stand-cart-storage";
import { standCartPath } from "@/lib/stand-seo";

export default function StandGoToCartBar({ standSlug }: { standSlug: string }) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeStandCart(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => {
    void getStandCartEpoch();
    return cartItemCount(readStandCartLines(standSlug));
  }, [standSlug]);

  const count = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  if (count <= 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--panel)]/95 px-4 py-4 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-lg">
        <Link
          href={standCartPath(standSlug)}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-4 text-lg font-semibold text-white"
        >
          Go to cart
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-sm">
            {count}
          </span>
        </Link>
      </div>
    </div>
  );
}

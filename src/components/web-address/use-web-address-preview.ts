"use client";

import { useEffect, useState } from "react";
import { previewWebAddressAction } from "@/app/dashboard/(gated)/settings/web-address-actions";
import type { WebAddressPreview } from "@/lib/storefront/web-address";

/** Website address a business name would get, refreshed shortly after typing stops. */
export function useWebAddressPreview(name: string): WebAddressPreview | null {
  const [preview, setPreview] = useState<WebAddressPreview | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const next = await previewWebAddressAction(name);
        if (!cancelled) setPreview(next);
      } catch (error) {
        console.error("Web address preview request failed", error);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name]);
  return preview;
}

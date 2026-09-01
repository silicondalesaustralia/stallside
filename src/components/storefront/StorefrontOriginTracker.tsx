"use client";

import { useEffect } from "react";
import { writeShopOrigin } from "@/lib/storefront/shop-origin";

export default function StorefrontOriginTracker({
  storefrontSlug,
}: {
  storefrontSlug: string;
}) {
  useEffect(() => {
    writeShopOrigin(storefrontSlug);
  }, [storefrontSlug]);
  return null;
}

"use client";

import { useEffect } from "react";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

export default function ProUpgradePageView({ currency }: { currency: string }) {
  useEffect(() => {
    trackProUpgrade("pro_upgrade_page_view", { currency });
  }, [currency]);
  return null;
}

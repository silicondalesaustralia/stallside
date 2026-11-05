"use client";

import { useEffect } from "react";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

/** Fires once when Stripe Checkout returns to Billing with success=1. */
export default function ProUpgradeCompleted() {
  useEffect(() => {
    trackProUpgrade("pro_upgrade_completed");
  }, []);
  return null;
}

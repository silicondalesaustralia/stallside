"use client";

import { useEffect } from "react";
import { rememberStallVisit } from "@/lib/storefront/at-stall";

export default function StallVisitMarker() {
  useEffect(() => {
    rememberStallVisit();
  }, []);
  return null;
}

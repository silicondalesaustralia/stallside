"use client";

import { useEffect } from "react";

/**
 * Persist Meta/Google click ids from the landing URL into a first-party cookie
 * before navigation. Loaded via DOM script (React 19 blocks next/script in trees).
 */
export default function AdClickCapture() {
  useEffect(() => {
    if (document.querySelector("[data-ss-ad-click-capture]")) return;
    const script = document.createElement("script");
    script.src = "/ad-click-capture.js";
    script.async = false;
    script.dataset.ssAdClickCapture = "1";
    document.head.appendChild(script);
  }, []);

  return null;
}

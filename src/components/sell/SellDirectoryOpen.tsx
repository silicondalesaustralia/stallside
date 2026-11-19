"use client";

import { useEffect } from "react";

/** Opens #directory when hash or view-all links target a category group. */
export default function SellDirectoryOpen() {
  useEffect(() => {
    function openIfNeeded() {
      const hash = window.location.hash;
      if (!hash) return;
      if (hash === "#directory" || hash.startsWith("#all-")) {
        const el = document.querySelector<HTMLDetailsElement>("#directory");
        if (el) el.open = true;
      }
    }
    openIfNeeded();
    window.addEventListener("hashchange", openIfNeeded);
    return () => window.removeEventListener("hashchange", openIfNeeded);
  }, []);
  return null;
}

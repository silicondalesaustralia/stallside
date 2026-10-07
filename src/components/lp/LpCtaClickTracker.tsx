"use client";

import { useEffect } from "react";

type Props = { campaign: string };

/** GA click event for [data-lp-cta] links. Registration conversions fire only on signup-complete. */
export default function LpCtaClickTracker({ campaign }: Props) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLElement>("[data-lp-cta]");
      if (!link) return;
      try {
        window.gtag?.("event", "lp_cta_click", {
          campaign,
          placement: link.dataset.placement ?? "unknown",
        });
      } catch (error) {
        console.error("[lp] CTA click tracking failed", error);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [campaign]);

  return null;
}

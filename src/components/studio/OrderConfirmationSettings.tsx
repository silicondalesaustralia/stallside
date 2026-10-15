"use client";

import type { CraftOrderConfirmationProps } from "@/components/studio/sections/CraftOrderConfirmationSection";

/** Order confirmation section: optional restock sign-up under the thank-you message. */
export default function OrderConfirmationSettings({
  props,
  setProp,
}: {
  props: CraftOrderConfirmationProps;
  setProp: (k: string, v: unknown) => void;
}) {
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Edit the heading, messages and button wording directly on the page.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={props.showRestock !== false}
          onChange={(e) => setProp("showRestock", e.target.checked)}
        />
        Show &ldquo;get notified when we restock&rdquo; sign-up
      </label>
      <p className="rounded-lg bg-[var(--wash)] p-2.5 text-xs text-[var(--muted)]">
        Shown after paid take-now orders (not pre-orders). Shoppers who sign up get an email when you restock.
      </p>
    </>
  );
}

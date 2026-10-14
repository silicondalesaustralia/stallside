"use client";

import Link from "next/link";
import { paymentBrandLabel } from "@/lib/payment-brand-assets";
import type { CraftPaymentsProps } from "@/components/studio/sections/CraftPaymentsSection";
import { useStudioMetadata } from "./StudioEditorContext";

/** Settings for the Payment options section. */
export default function PaymentsSettings({
  props,
  setProp,
}: {
  props: CraftPaymentsProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const meta = useStudioMetadata();
  const brands = meta.paymentBrands ?? [];
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Shows whatever payment methods are switched on and ready, and updates by itself when you change them.
        {brands.length ? ` Showing: ${brands.map(paymentBrandLabel).join(", ")}.` : " None are on yet."}
      </p>
      <Link
        href={`/dashboard/businesses/${meta.standId}`}
        className="text-xs font-semibold text-[var(--leaf-dark)] underline"
        target="_blank"
      >
        Change payment methods
      </Link>
      <div className="space-y-1.5">
        <p className="block text-xs font-semibold text-[var(--field)]">Style</p>
        {(["slider", "bar"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input type="radio" name="paymentsLayout" checked={props.layout === opt} onChange={() => setProp("layout", opt)} />
            {opt === "slider" ? "Scrolling slider" : "Static bar"}
          </label>
        ))}
        {props.layout === "slider" ? (
          <p className="text-xs text-[var(--muted)]">Scrolls when there are 4 or more methods; pauses on hover.</p>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showLabels} onChange={(e) => setProp("showLabels", e.target.checked)} />
        Show names under icons
      </label>
    </>
  );
}

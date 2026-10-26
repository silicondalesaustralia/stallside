"use client";

import { useState, useTransition } from "react";
import { TAX_REGIONS, taxRegion } from "@/lib/tax/regions";
import { updateTaxSettings } from "./gst-actions";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2";

export default function TaxSettingsForm({
  country,
  rateBps,
  taxId,
  registered,
}: {
  country: string;
  rateBps: number | null;
  taxId: string | null;
  registered: boolean;
}) {
  const [picked, setPicked] = useState(country);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const region = taxRegion(picked);
  const known = TAX_REGIONS.some((r) => r.country === picked);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateTaxSettings(formData);
        setMessage("error" in result ? result.error : "Tax settings saved.");
      } catch (error) {
        console.error("updateTaxSettings failed", error);
        setMessage("Could not save tax settings.");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">Country</span>
          <select name="taxCountry" value={picked} onChange={(e) => setPicked(e.target.value)} className={inputClass}>
            {TAX_REGIONS.map((r) => (
              <option key={r.country} value={r.country}>
                {r.label} ({r.name})
              </option>
            ))}
            {known ? null : <option value={picked}>{picked}</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">{region.name} rate (%)</span>
          <input
            key={picked}
            name="taxRate"
            inputMode="decimal"
            defaultValue={rateBps != null && picked === country ? String(rateBps / 100) : ""}
            placeholder={region.defaultRateBps != null ? String(region.defaultRateBps / 100) : "e.g. 8.25"}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-medium">{region.idLabel}</span>
          <input name="taxId" maxLength={30} defaultValue={taxId ?? ""} className={inputClass} />
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="registered" defaultChecked={registered} />
        <span>
          Registered for {region.name}
          {region.inclusive ? ` (my prices include ${region.name})` : ` (add ${region.name.toLowerCase()} at checkout)`}
        </span>
      </label>
      <p className="text-xs text-[var(--muted)]">
        {region.inclusive
          ? `Vendl works out the ${region.name} inside each sale for your reports. Shoppers pay the shelf price.`
          : `Shoppers see ${region.name.toLowerCase()} added to their cart total. Use your combined state/local or provincial rate, and mark exempt products on each product.`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      </div>
    </form>
  );
}

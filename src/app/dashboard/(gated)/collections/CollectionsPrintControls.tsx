"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LABEL_SHEET,
  LABEL_SHEETS,
  type LabelSheetId,
} from "@/lib/print-label-sheets";
import CollectionLabelsPrint, {
  type PrintLabelOrder,
} from "./CollectionLabelsPrint";
import CollectionListPrintSheet, {
  type PrintDayGroup,
} from "./CollectionListPrintSheet";
import type { PrintBrand } from "./CollectionPrintBrand";

const PRINT_ATTR = "data-collections-print";

export default function CollectionsPrintControls({
  days,
  labelOrders,
  brand,
}: {
  days: PrintDayGroup[];
  labelOrders: PrintLabelOrder[];
  brand: PrintBrand;
}) {
  const [sheetId, setSheetId] = useState<LabelSheetId>(DEFAULT_LABEL_SHEET);
  const [includeBrand, setIncludeBrand] = useState(true);

  useEffect(() => {
    function clear() {
      document.documentElement.removeAttribute(PRINT_ATTR);
    }
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);

  function print(mode: "list" | "labels") {
    document.documentElement.setAttribute(PRINT_ATTR, mode);
    requestAnimationFrame(() => window.print());
  }

  const sheet = LABEL_SHEETS[sheetId];

  return (
    <>
      <div className="flex w-full flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 print:hidden sm:max-w-md">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Label sheet</span>
          <select
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value as LabelSheetId)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            {(Object.keys(LABEL_SHEETS) as LabelSheetId[]).map((id) => (
              <option key={id} value={id}>
                {LABEL_SHEETS[id].name}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--muted)]">{sheet.blurb}</span>
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeBrand}
            onChange={(e) => setIncludeBrand(e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <span className="font-medium">Include business name and logo</span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              On the list header and on every label
              {!brand.logoUrl ? " (name only - no logo uploaded yet)" : ""}
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => print("list")}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)]"
          >
            Print list
          </button>
          <button
            type="button"
            onClick={() => print("labels")}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium hover:border-[var(--leaf)]"
          >
            Print labels
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Print at 100% / Actual size. Do not use Fit to page.
        </p>
      </div>

      <CollectionListPrintSheet
        days={days}
        brand={brand}
        showBrand={includeBrand}
      />
      <CollectionLabelsPrint
        orders={labelOrders}
        template={sheet}
        brand={brand}
        showBrand={includeBrand}
      />
    </>
  );
}

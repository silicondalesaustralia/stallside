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
import { clearCollectionPrint, runCollectionPrint } from "./run-collection-print";

export default function CollectionsPrintControls({
  printId,
  sheetTitle,
  days,
  labelOrders,
  brand,
}: {
  printId: string;
  sheetTitle?: string;
  days: PrintDayGroup[];
  labelOrders: PrintLabelOrder[];
  brand: PrintBrand;
}) {
  const [sheetId, setSheetId] = useState<LabelSheetId>(DEFAULT_LABEL_SHEET);
  const [includeBrand, setIncludeBrand] = useState(true);

  useEffect(() => {
    window.addEventListener("afterprint", clearCollectionPrint);
    return () => window.removeEventListener("afterprint", clearCollectionPrint);
  }, []);

  const sheet = LABEL_SHEETS[sheetId];

  return (
    <>
      <div className="collections-screen-only flex w-full flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--wash)] p-3">
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
            onClick={() => runCollectionPrint(printId, "list")}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)]"
          >
            Print list
          </button>
          <button
            type="button"
            onClick={() => runCollectionPrint(printId, "labels")}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium hover:border-[var(--leaf)]"
          >
            Print labels
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Prints this pre-order page only. Use 100% / Actual size.
        </p>
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt="" className="sr-only" />
        ) : null}
      </div>

      <CollectionListPrintSheet
        printId={printId}
        sheetTitle={sheetTitle}
        days={days}
        brand={brand}
        showBrand={includeBrand}
      />
      <CollectionLabelsPrint
        printId={printId}
        orders={labelOrders}
        template={sheet}
        brand={brand}
        showBrand={includeBrand}
      />
    </>
  );
}

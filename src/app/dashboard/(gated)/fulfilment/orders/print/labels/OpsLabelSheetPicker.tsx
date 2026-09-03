"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  LABEL_SHEETS,
  type LabelSheetId,
} from "@/lib/print-label-sheets";

export default function OpsLabelSheetPicker({
  current,
}: {
  current: LabelSheetId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium">Sheet</span>
      <select
        value={current}
        className="rounded-lg border border-[var(--line)] bg-white px-2 py-1.5"
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set("sheet", e.target.value);
          router.push(`?${next.toString()}`);
        }}
      >
        {(Object.keys(LABEL_SHEETS) as LabelSheetId[]).map((id) => (
          <option key={id} value={id}>
            {LABEL_SHEETS[id].name}
          </option>
        ))}
      </select>
    </label>
  );
}

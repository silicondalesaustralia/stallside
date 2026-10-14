"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontBrandNameSize } from "@/app/dashboard/(gated)/website/studio/page-background-actions";
import { useDraftSetting } from "./useDraftSetting";

const save = (brandNameSize: number | null, expectedRevision: number) =>
  saveStorefrontBrandNameSize({ brandNameSize, expectedRevision });
const problem = () => null;

/** Header business name text size: previewed at once, saved to the draft shortly after. */
export function useBrandNameSize(input: {
  initial: number | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "name text size" });
  return useMemo(
    () => ({
      brandNameSize: setting.value,
      setBrandNameSize: (next: number | null) => setting.update(next),
      brandNameSizeStatus: setting.status,
      brandNameSizeError: setting.error,
    }),
    [setting],
  );
}

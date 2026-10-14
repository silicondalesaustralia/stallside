"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontNavTextSize } from "@/app/dashboard/(gated)/website/studio/page-background-actions";
import { useDraftSetting } from "./useDraftSetting";

const save = (navTextSize: number | null, expectedRevision: number) =>
  saveStorefrontNavTextSize({ navTextSize, expectedRevision });
const problem = () => null;

/** Header menu link text size: previewed at once, saved to the draft shortly after. */
export function useNavTextSize(input: {
  initial: number | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "menu text size" });
  return useMemo(
    () => ({
      navTextSize: setting.value,
      setNavTextSize: (next: number | null) => setting.update(next),
      navTextSizeStatus: setting.status,
      navTextSizeError: setting.error,
    }),
    [setting],
  );
}

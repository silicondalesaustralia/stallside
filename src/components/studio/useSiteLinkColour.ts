"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontLinkColour } from "@/app/dashboard/(gated)/website/studio/page-background-actions";
import { useDraftSetting } from "./useDraftSetting";

const save = (linkColour: string | null, expectedRevision: number) =>
  saveStorefrontLinkColour({ linkColour, expectedRevision });
const problem = () => null;

/** One colour for text links on every page: previewed at once, saved to the draft shortly after. */
export function useSiteLinkColour(input: {
  initial: string | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "site link colour" });
  return useMemo(
    () => ({
      siteLinkColour: setting.value,
      setSiteLinkColour: (next: string | null) => setting.update(next),
      siteLinkColourStatus: setting.status,
      siteLinkColourError: setting.error,
    }),
    [setting],
  );
}

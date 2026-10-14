"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontButtonColours } from "@/app/dashboard/(gated)/website/studio/page-background-actions";
import type { SiteButtonColours } from "@/lib/storefront/site-buttons";
import { useDraftSetting } from "./useDraftSetting";

const save = (colours: SiteButtonColours, expectedRevision: number) =>
  saveStorefrontButtonColours({
    buttonColour: colours.background,
    buttonTextColour: colours.text,
    expectedRevision,
  });
const problem = () => null;

/** One colour for every main button on the site: previewed at once, saved to the draft shortly after. */
export function useSiteButtonColours(input: {
  initial: SiteButtonColours;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "site button colours" });
  return useMemo(
    () => ({
      siteButtonColours: setting.value,
      setSiteButtonColours: (next: SiteButtonColours) => setting.update(next),
      siteButtonColoursStatus: setting.status,
      siteButtonColoursError: setting.error,
    }),
    [setting],
  );
}

"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontSiteStyle } from "@/app/dashboard/(gated)/website/studio/page-background-actions";
import type { SiteStyle } from "@/lib/storefront/site-style";
import { useDraftSetting } from "./useDraftSetting";

const save = (siteStyle: SiteStyle, expectedRevision: number) => saveStorefrontSiteStyle({ siteStyle, expectedRevision });
const problem = () => null;

/** Site-wide fonts, colours, sizes, width and spacing: previewed at once, saved shortly after. */
export function useSiteStyle(input: {
  initial: SiteStyle;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "site-wide style" });
  return useMemo(
    () => ({
      siteStyle: setting.value,
      /** Sets one field; undefined goes back to the template default. */
      setSiteStyleField: <K extends keyof SiteStyle>(key: K, value: SiteStyle[K] | undefined) => {
        const next: SiteStyle = { ...setting.value };
        if (value === undefined) delete next[key];
        else next[key] = value;
        setting.update(next);
      },
      siteStyleStatus: setting.status,
      siteStyleError: setting.error,
    }),
    [setting],
  );
}

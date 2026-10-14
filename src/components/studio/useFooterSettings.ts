"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontFooter } from "@/app/dashboard/(gated)/website/studio/header-actions";
import { footerSettingsProblem, type FooterSettings } from "@/lib/studio/footer-settings";
import { useDraftSetting } from "./useDraftSetting";

const save = (footer: FooterSettings | null, expectedRevision: number) =>
  saveStorefrontFooter({ footer, expectedRevision });
const problem = (footer: FooterSettings | null) => (footer ? footerSettingsProblem(footer) : null);

/** The footer: previewed at once, saved to the draft shortly after the last change. */
export function useFooterSettings(input: {
  initial: FooterSettings | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "footer" });
  return useMemo(
    () => ({
      footer: setting.value,
      setFooter: (next: FooterSettings | null) => setting.update(next),
      footerStatus: setting.status,
      footerError: setting.error,
    }),
    [setting],
  );
}

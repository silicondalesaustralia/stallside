"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontAnnouncementBar } from "@/app/dashboard/(gated)/website/studio/header-actions";
import { announcementBarProblem, type AnnouncementBar } from "@/lib/studio/announcement-bar";
import { useDraftSetting } from "./useDraftSetting";

const save = (bar: AnnouncementBar | null, expectedRevision: number) =>
  saveStorefrontAnnouncementBar({ bar, expectedRevision });
const problem = (bar: AnnouncementBar | null) => (bar ? announcementBarProblem(bar) : null);

/** The announcement bar: previewed at once, saved to the draft shortly after the last change. */
export function useAnnouncementBar(input: {
  initial: AnnouncementBar | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "announcement bar" });
  return useMemo(
    () => ({
      announcementBar: setting.value,
      setAnnouncementBar: (next: AnnouncementBar) => setting.update(next),
      announcementBarStatus: setting.status,
      announcementBarError: setting.error,
    }),
    [setting],
  );
}

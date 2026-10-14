"use client";

import { useMemo, type RefObject } from "react";
import { saveStorefrontHeaderMenu } from "@/app/dashboard/(gated)/website/studio/header-actions";
import { headerMenuProblem, type HeaderMenu } from "@/lib/studio/header-menu";
import { useDraftSetting } from "./useDraftSetting";

const save = (menu: HeaderMenu | null, expectedRevision: number) =>
  saveStorefrontHeaderMenu({ menu, expectedRevision });
const problem = (menu: HeaderMenu | null) => (menu ? headerMenuProblem(menu) : null);

/** The header menu: shown in the editor as you type, saved to the draft shortly after you stop. */
export function useHeaderMenu(input: {
  initial: HeaderMenu | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const setting = useDraftSetting({ ...input, save, problem, logLabel: "header menu" });
  return useMemo(
    () => ({
      headerMenu: setting.value,
      setHeaderMenu: (next: HeaderMenu | null) => setting.update(next, next === null),
      headerMenuStatus: setting.status,
      headerMenuError: setting.error,
    }),
    [setting],
  );
}

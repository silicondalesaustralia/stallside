"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { saveStorefrontHeaderMenu } from "@/app/dashboard/(gated)/website/studio/header-menu-actions";
import { headerMenuProblem, type HeaderMenu } from "@/lib/studio/header-menu";
import type { SiteSettingStatus } from "./useSitePageBackground";

const SAVE_DELAY_MS = 800;

/** The header menu: shown in the editor as you type, saved to the draft shortly after you stop. */
export function useHeaderMenu(input: {
  initial: HeaderMenu | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const { revisionRef, runExclusive } = input;
  const [menu, setMenu] = useState<HeaderMenu | null>(input.initial);
  const [status, setStatus] = useState<SiteSettingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const persist = useCallback(
    async (next: HeaderMenu | null) => {
      setStatus("saving");
      try {
        const result = await runExclusive(() =>
          saveStorefrontHeaderMenu({ menu: next, expectedRevision: revisionRef.current }),
        );
        if (result.ok) {
          revisionRef.current = result.revision;
          setStatus("saved");
        } else {
          setError(result.error);
          setStatus("error");
        }
      } catch (err) {
        console.error("[header menu]", err);
        setError("Couldn't reach the server. Try again.");
        setStatus("error");
      }
    },
    [revisionRef, runExclusive],
  );

  const update = useCallback(
    (next: HeaderMenu | null) => {
      setMenu(next);
      if (timer.current) clearTimeout(timer.current);
      const problem = next ? headerMenuProblem(next) : null;
      setError(problem);
      if (problem) {
        setStatus("error");
        return;
      }
      setStatus("idle");
      timer.current = setTimeout(() => void persist(next), next ? SAVE_DELAY_MS : 0);
    },
    [persist],
  );

  return useMemo(
    () => ({ headerMenu: menu, setHeaderMenu: update, headerMenuStatus: status, headerMenuError: error }),
    [menu, update, status, error],
  );
}

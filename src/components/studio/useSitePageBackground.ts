"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import { saveStorefrontPageBackground } from "@/app/dashboard/(gated)/website/studio/page-background-actions";

export type SiteSettingStatus = "idle" | "saving" | "saved" | "error";

/** Site-wide page background: shown in the editor immediately, saved to the draft right away. */
export function useSitePageBackground(input: {
  initial: string | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const { revisionRef, runExclusive } = input;
  const [value, setValue] = useState<string | null>(input.initial);
  const [status, setStatus] = useState<SiteSettingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    (next: string | null) => {
      setValue(next);
      setStatus("saving");
      setError(null);
      void (async () => {
        try {
          const result = await runExclusive(() =>
            saveStorefrontPageBackground({ pageBackground: next, expectedRevision: revisionRef.current }),
          );
          if (result.ok) {
            revisionRef.current = result.revision;
            setStatus("saved");
          } else {
            setError(result.error);
            setStatus("error");
          }
        } catch (err) {
          console.error("[site page background]", err);
          setError("Couldn't reach the server. Try again.");
          setStatus("error");
        }
      })();
    },
    [revisionRef, runExclusive],
  );

  return useMemo(
    () => ({
      sitePageBackground: value,
      setSitePageBackground: save,
      sitePageBackgroundStatus: status,
      sitePageBackgroundError: error,
    }),
    [value, save, status, error],
  );
}

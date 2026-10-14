"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { DraftKeyResult } from "@/lib/website/persistence/draft-key";
import type { SiteSettingStatus } from "./useSitePageBackground";

/**
 * A site-wide draft setting edited in the builder: shown at once, saved shortly after the
 * last change (queued behind layout autosave). Invalid values are kept on screen, not saved.
 */
export function useDraftSetting<T>(input: {
  initial: T;
  save: (value: T, expectedRevision: number) => Promise<DraftKeyResult>;
  problem: (value: T) => string | null;
  revisionRef: RefObject<number>;
  runExclusive: <R>(task: () => Promise<R>) => Promise<R>;
  delayMs?: number;
  logLabel: string;
}) {
  const { save, problem, revisionRef, runExclusive, logLabel } = input;
  const delayMs = input.delayMs ?? 800;
  const [value, setValue] = useState<T>(input.initial);
  const [status, setStatus] = useState<SiteSettingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const persist = useCallback(
    async (next: T) => {
      setStatus("saving");
      try {
        const result = await runExclusive(() => save(next, revisionRef.current));
        if (result.ok) {
          revisionRef.current = result.revision;
          setStatus("saved");
        } else {
          setError(result.error);
          setStatus("error");
        }
      } catch (err) {
        console.error(`[${logLabel}]`, err);
        setError("Couldn't reach the server. Try again.");
        setStatus("error");
      }
    },
    [save, revisionRef, runExclusive, logLabel],
  );

  const update = useCallback(
    (next: T, immediate = false) => {
      setValue(next);
      if (timer.current) clearTimeout(timer.current);
      const issue = problem(next);
      setError(issue);
      if (issue) {
        setStatus("error");
        return;
      }
      setStatus("idle");
      timer.current = setTimeout(() => void persist(next), immediate ? 0 : delayMs);
    },
    [persist, problem, delayMs],
  );

  return useMemo(() => ({ value, update, status, error }), [value, update, status, error]);
}

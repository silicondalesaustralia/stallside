"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const WATCH = ["input", "change", "click", "keyup"] as const;

function snapshot(form: HTMLFormElement | null): string {
  if (!form) return "";
  const pairs: [string, string][] = [];
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string") pairs.push([key, value]);
  }
  return JSON.stringify(pairs);
}

/**
 * Unsaved-changes tracking for a form: compares its values with the last saved ones,
 * warns before leaving with changes, and saves on Ctrl/⌘+S. Change `resetKey` after a discard.
 */
export function useFormDirty(formRef: RefObject<HTMLFormElement | null>, resetKey: number) {
  const baseline = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const markSaved = useCallback(() => {
    baseline.current = snapshot(formRef.current);
    setDirty(false);
  }, [formRef]);

  useEffect(() => {
    const frame = requestAnimationFrame(markSaved);
    return () => cancelAnimationFrame(frame);
  }, [resetKey, markSaved]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (baseline.current !== null) setDirty(snapshot(form) !== baseline.current);
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        form.requestSubmit();
      }
    };
    for (const type of WATCH) form.addEventListener(type, check);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      for (const type of WATCH) form.removeEventListener(type, check);
      window.removeEventListener("keydown", onKey);
    };
  }, [formRef]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return { dirty, markSaved };
}

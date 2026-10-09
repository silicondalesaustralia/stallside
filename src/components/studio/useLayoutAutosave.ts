"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  autosaveWebsiteLayout,
  type AutosaveTargetInput,
} from "@/app/dashboard/(gated)/website/autosave/actions";
import type { StudioSaveStatus } from "@/components/craft/CraftEditorContext";

const DELAY_MS = 2500;
const RETRY_MS = 15000;

type Callbacks = {
  setDirty: (dirty: boolean) => void;
  setSaveStatus: (status: StudioSaveStatus) => void;
  setSaveError: (message: string | null) => void;
};

/**
 * Saves the layout to the draft shortly after the seller stops editing.
 * Changes before the seller first touches the editor (loading the page or a
 * starter layout) only set the baseline and are never saved.
 */
export function useLayoutAutosave(input: {
  target: AutosaveTargetInput;
  serializedRef: RefObject<string>;
  revisionRef: RefObject<number>;
  changeTick: number;
  dirty: boolean;
} & Callbacks) {
  const { serializedRef, revisionRef, changeTick, dirty } = input;
  const targetKey = JSON.stringify(input.target);
  const callbacks = useRef<Callbacks>(input);
  useLayoutEffect(() => {
    callbacks.current = input;
  });
  const baselineRef = useRef<string | null>(null);
  const interactedRef = useRef(false);
  const stoppedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);

  const save = useCallback(async (): Promise<boolean> => {
    const nodes = serializedRef.current;
    if (stoppedRef.current || !nodes || nodes === baselineRef.current) return false;
    const cb = callbacks.current;
    cb.setSaveStatus("saving");
    try {
      const target = JSON.parse(targetKey) as AutosaveTargetInput;
      const result = await autosaveWebsiteLayout(target, nodes, revisionRef.current);
      if (result.ok) {
        revisionRef.current = result.revision;
        baselineRef.current = nodes;
        const clean = serializedRef.current === nodes;
        cb.setDirty(!clean);
        cb.setSaveStatus(clean ? "saved" : "idle");
        cb.setSaveError(null);
        return false;
      }
      if (result.error === "conflict" || result.error === "missing") stoppedRef.current = true;
      cb.setSaveStatus(result.error === "conflict" ? "conflict" : "error");
      cb.setSaveError(result.message);
      return result.error === "failed";
    } catch (err) {
      console.error("[website autosave]", err);
      cb.setSaveStatus("error");
      cb.setSaveError("Couldn't reach the server. We'll keep trying.");
      return true;
    }
  }, [targetKey, serializedRef, revisionRef]);

  const schedule = useCallback(
    function scheduleSave(delay: number) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const run = (inFlightRef.current ?? Promise.resolve()).then(save).then((retry) => {
          if (retry) scheduleSave(RETRY_MS);
        });
        inFlightRef.current = run;
        void run.finally(() => {
          if (inFlightRef.current === run) inFlightRef.current = null;
        });
      }, delay);
    },
    [save],
  );

  useEffect(() => {
    if (changeTick === 0) return;
    if (!interactedRef.current) {
      baselineRef.current = serializedRef.current;
      return;
    }
    if (serializedRef.current === baselineRef.current) return;
    callbacks.current.setDirty(true);
    callbacks.current.setSaveStatus("idle");
    if (!stoppedRef.current) schedule(DELAY_MS);
  }, [changeTick, schedule, serializedRef]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const flush = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const run = (inFlightRef.current ?? Promise.resolve()).then(save);
      inFlightRef.current = run.then(() => undefined);
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      flush();
    };
  }, [save]);

  const markInteraction = useCallback(() => {
    interactedRef.current = true;
  }, []);

  /** Call before a manual save/publish so it sends the latest revision. */
  const settle = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    await inFlightRef.current;
  }, []);

  return { markInteraction, settle };
}

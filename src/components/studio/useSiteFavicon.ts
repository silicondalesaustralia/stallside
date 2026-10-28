"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import { saveStorefrontFavicon } from "@/app/dashboard/(gated)/website/studio/favicon-actions";

type Status = "idle" | "saving" | "saved" | "error";

/** Site favicon: uploads or removes it in the draft, queued behind other editor saves. */
export function useSiteFavicon(input: {
  initial: string | null;
  revisionRef: RefObject<number>;
  runExclusive: <T>(task: () => Promise<T>) => Promise<T>;
}) {
  const { revisionRef, runExclusive } = input;
  const [faviconUrl, setFaviconUrl] = useState(input.initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (file: File | null) => {
      setStatus("saving");
      setError(null);
      try {
        const result = await runExclusive(() => {
          const formData = new FormData();
          formData.set("expectedRevision", String(revisionRef.current));
          if (file) formData.set("favicon", file);
          else formData.set("remove", "1");
          return saveStorefrontFavicon(formData);
        });
        if (!result.ok) {
          setError(result.error);
          setStatus("error");
          return;
        }
        revisionRef.current = result.revision;
        setFaviconUrl(result.faviconUrl);
        setStatus("saved");
      } catch (err) {
        console.error("[site favicon save]", err);
        setError("Couldn't reach the server. Try again.");
        setStatus("error");
      }
    },
    [revisionRef, runExclusive],
  );

  return useMemo(
    () => ({
      faviconUrl,
      uploadFavicon: (file: File) => save(file),
      removeFavicon: () => save(null),
      faviconStatus: status,
      faviconError: error,
    }),
    [faviconUrl, save, status, error],
  );
}

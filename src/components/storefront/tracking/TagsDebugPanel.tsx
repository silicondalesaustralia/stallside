"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { emptyTagsLog, subscribeTagsLog, tagsLogSnapshot } from "@/lib/website/tracking/debug-log";
import { loadedTagLibraries } from "@/lib/website/tracking/dispatch";
import { TRACKING_FIELD_BY_KEY } from "@/lib/website/tracking/fields";
import type { TrackingIds } from "@/lib/website/tracking/types";

/** ?vendl_tags_debug=1: which tags are configured, which libraries loaded, and events sent. */
export default function TagsDebugPanel({ ids, consent }: { ids: TrackingIds; consent: string }) {
  const log = useSyncExternalStore(subscribeTagsLog, tagsLogSnapshot, emptyTagsLog);
  const [libs, setLibs] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setLibs(loadedTagLibraries()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-3 left-3 z-[61] rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black shadow">
        Tags test mode
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 z-[61] max-h-[70vh] w-80 overflow-auto rounded-xl border border-amber-400 bg-white p-3 text-xs text-neutral-800 shadow-xl">
      <div className="flex items-center justify-between">
        <strong>Vendl tags test mode</strong>
        <button type="button" onClick={() => setOpen(false)} className="underline">Hide</button>
      </div>
      <p className="mt-1 text-neutral-500">Consent: {consent}</p>
      <ul className="mt-2 space-y-0.5">
        {Object.entries(ids).map(([key, value]) => (
          <li key={key}>
            {TRACKING_FIELD_BY_KEY.get(key as keyof TrackingIds)?.label ?? key}: <code>{value}</code>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-semibold">Libraries on page</p>
      <p className="mt-0.5 leading-5">
        {Object.entries(libs).map(([name, ok]) => (
          <span key={name} className={`mr-1 inline-block rounded px-1 ${ok ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-400"}`}>
            {name}
          </span>
        ))}
      </p>
      <p className="mt-2 font-semibold">Events sent</p>
      {log.length === 0 ? (
        <p className="text-neutral-500">None yet. Add something to the cart to test.</p>
      ) : (
        <ul className="mt-0.5 space-y-0.5">
          {log.map((entry, i) => (
            <li key={`${entry.at}-${i}`}>
              <span className="text-neutral-400">{entry.at}</span> <strong>{entry.event}</strong> {entry.detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

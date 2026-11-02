export type TagsLogEntry = { at: string; event: string; detail: string };

const EMPTY: TagsLogEntry[] = [];
let entries: TagsLogEntry[] = EMPTY;
const listeners = new Set<() => void>();

/** Test-mode event log (useSyncExternalStore store). */
export function pushTagsLog(event: string, detail: string) {
  entries = [{ at: new Date().toLocaleTimeString(), event, detail }, ...entries].slice(0, 30);
  listeners.forEach((listener) => listener());
}

export function subscribeTagsLog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const tagsLogSnapshot = () => entries;

export const emptyTagsLog = () => EMPTY;

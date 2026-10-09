/** Returned by editor save/publish actions when they don't redirect. */
export type EditorSaveResult =
  | { ok: false; error: "conflict" | "publish_blocked"; message: string };

export const conflictResult = (message: string): EditorSaveResult => ({
  ok: false,
  error: "conflict",
  message,
});

export const publishBlockedResult = (blockers: string[]): EditorSaveResult => ({
  ok: false,
  error: "publish_blocked",
  message: blockers.join(" "),
});

import { DRAFT_CONFLICT_MESSAGE } from "./draft-store";
import type { PublishResult } from "./publish";

/** Returned by editor save/publish actions when they don't redirect. */
export type EditorSaveResult =
  | { ok: false; error: "conflict" | "publish_blocked" | "invalid"; message: string };

export const invalidResult = (errors: string[]): EditorSaveResult => ({
  ok: false,
  error: "invalid",
  message: `Can't save: ${errors.join(" ")}`,
});

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

export const publishFailureResult = (
  result: Exclude<PublishResult, { ok: true }>,
): EditorSaveResult =>
  result.reason === "conflict"
    ? conflictResult(DRAFT_CONFLICT_MESSAGE)
    : publishBlockedResult(result.blockers);

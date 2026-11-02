import type { TrackingIdKey } from "@/lib/website/tracking/types";

export const TAGS_PATH = "/dashboard/website/tags-pixels";

export type TagsSaveState = {
  status: "idle" | "saved" | "error";
  message?: string;
  errors: Partial<Record<TrackingIdKey, string>>;
  /** Submitted values, echoed back on error so the form keeps what was typed. */
  values: Record<string, string>;
  warnings: string[];
};

export const INITIAL_TAGS_STATE: TagsSaveState = { status: "idle", errors: {}, values: {}, warnings: [] };

export type ActionMessage = { status: "idle" | "ok" | "error"; message?: string; lines?: string[] };

export const INITIAL_ACTION_MESSAGE: ActionMessage = { status: "idle" };

export type InstallCheckState = {
  status: "idle" | "done" | "error";
  message?: string;
  url?: string;
  lines: { label: string; ok: boolean; detail: string }[];
};

export const INITIAL_INSTALL_CHECK: InstallCheckState = { status: "idle", lines: [] };

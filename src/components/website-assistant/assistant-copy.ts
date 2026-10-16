import type { BriefData, PrimaryGoal } from "@/lib/website-ai/assistant/brief/schema";

export const GOAL_LABELS: Record<PrimaryGoal, string> = {
  sell_online: "Sell online",
  local_visits: "Get people to visit or collect",
  pre_orders: "Take pre-orders",
  subscriptions: "Sell subscriptions or boxes",
  enquiries: "Get enquiries",
  information: "Share information",
};

export const STEP_LABELS = [
  "Your business",
  "Branding & photos",
  "Look & features",
  "Your website",
  "Create & preview",
] as const;

export const SEARCH_PROFILE_HREF = "/dashboard/website/web-studio?tab=details#search-profile";

export type BriefUpdater = (fn: (brief: BriefData) => BriefData) => void;

export const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--field)]";
export const primaryButton =
  "w-fit rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60";
export const secondaryButton =
  "rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--field)] hover:border-[var(--field)] disabled:opacity-60";

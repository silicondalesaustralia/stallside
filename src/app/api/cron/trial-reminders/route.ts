import { GET as lifecycleGet } from "@/app/api/cron/lifecycle/route";

export const runtime = "nodejs";

/** @deprecated Prefer /api/cron/lifecycle. Same handler for old cron configs. */
export const GET = lifecycleGet;

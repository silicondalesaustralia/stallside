import { STITCHSTACK_APP_URL as STITCHSTACK_APP_URL_DEFAULT } from "@/lib/stitchstack-constants";

export type StitchstackPixelConfig = {
  orgId: string;
  siteId: string;
  viewId?: string;
  scriptSrc: string;
  enabled: boolean;
  installedAt: string;
};

export type StitchstackPixelPayload = {
  org_id?: unknown;
  site_id?: unknown;
  view_id?: unknown;
  script_src?: unknown;
};

function stitchstackAppUrl(): string {
  return process.env.STITCHSTACK_APP_URL?.trim().replace(/\/$/, "") || STITCHSTACK_APP_URL_DEFAULT;
}

function allowedScriptHost(): string {
  try {
    return new URL(stitchstackAppUrl()).host.toLowerCase();
  } catch {
    return "stitchstack.app";
  }
}

/** True when scriptSrc is https and hosted on the configured Stitchstack host. */
export function isAllowedStitchstackScriptSrc(scriptSrc: string): boolean {
  try {
    const url = new URL(scriptSrc);
    return url.protocol === "https:" && url.host.toLowerCase() === allowedScriptHost();
  } catch {
    return false;
  }
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Parse pixel from ensure-account. Builds script_src from ids when Stitchstack
 * only returns org/site (same path shape as the marketing attribution script).
 */
export function parseStitchstackPixelPayload(
  pixel: StitchstackPixelPayload | null | undefined,
): StitchstackPixelConfig | null {
  if (!pixel || typeof pixel !== "object") return null;
  const orgId = asNonEmptyString(pixel.org_id);
  const siteId = asNonEmptyString(pixel.site_id);
  if (!orgId || !siteId) return null;

  const viewId = asNonEmptyString(pixel.view_id) ?? undefined;
  let scriptSrc = asNonEmptyString(pixel.script_src);
  if (!scriptSrc) {
    const params = new URLSearchParams({ orgId, siteId });
    if (viewId) params.set("viewId", viewId);
    scriptSrc = `${stitchstackAppUrl()}/api/attribution/script?${params.toString()}`;
  }
  if (!isAllowedStitchstackScriptSrc(scriptSrc)) return null;

  return {
    orgId,
    siteId,
    ...(viewId ? { viewId } : {}),
    scriptSrc,
    enabled: true,
    installedAt: new Date().toISOString(),
  };
}

export function readStitchstackPixel(raw: unknown): StitchstackPixelConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const orgId = asNonEmptyString(obj.orgId);
  const siteId = asNonEmptyString(obj.siteId);
  const scriptSrc = asNonEmptyString(obj.scriptSrc);
  if (!orgId || !siteId || !scriptSrc || !isAllowedStitchstackScriptSrc(scriptSrc)) return null;
  const viewId = asNonEmptyString(obj.viewId) ?? undefined;
  return {
    orgId,
    siteId,
    ...(viewId ? { viewId } : {}),
    scriptSrc,
    enabled: obj.enabled !== false,
    installedAt: asNonEmptyString(obj.installedAt) ?? new Date().toISOString(),
  };
}

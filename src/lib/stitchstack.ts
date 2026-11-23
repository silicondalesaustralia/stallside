import {
  parseStitchstackPixelPayload,
  type StitchstackPixelConfig,
  type StitchstackPixelPayload,
} from "@/lib/stitchstack-pixel";

/** Public Stitchstack app URL (fallback when partner SSO is not configured). */
export const STITCHSTACK_APP_URL =
  process.env.STITCHSTACK_APP_URL?.trim().replace(/\/$/, "") || "https://stitchstack.app";

/** Vendl server route that mints SSO and redirects into Stitchstack. */
export const STITCHSTACK_ANALYTICS_HANDOFF_PATH = "/dashboard/analytics/stitchstack";

export type StitchstackEnsureResult = {
  ok: true;
  stitchstack_org_id: string;
  stitchstack_user_id: string;
  plan: string;
  entitlements: string[];
  handoff_url: string;
  /** Present once Stitchstack ships pixel-first ensure; optional for backward compat. */
  pixel?: StitchstackPixelConfig;
};

export type StitchstackEnsureError = {
  ok: false;
  error: { code: string; message: string };
};

export type StitchstackEnsureInput = {
  external_account_id: string;
  external_user_id: string;
  email: string;
  name?: string | null;
  business_name?: string | null;
  site_url?: string | null;
  /** Public https logo URL for Stitchstack tenant branding. */
  logo_url?: string | null;
  role?: "owner" | "member";
  impersonating?: boolean;
};

function partnerApiKey(): string | null {
  return process.env.STITCHSTACK_PARTNER_API_KEY?.trim() || process.env.VENDL_PARTNER_API_KEY?.trim() || null;
}

/** True when Vendl can call Stitchstack ensure-account (server env set). */
export function isStitchstackPartnerConfigured(): boolean {
  return Boolean(partnerApiKey());
}

/**
 * Server-only: provision/attach a gated Stitchstack workspace and return a one-time handoff URL.
 * When Stitchstack returns `pixel`, it is normalised for Vendl storefront install.
 */
export async function ensureStitchstackAnalyticsAccount(
  input: StitchstackEnsureInput,
): Promise<StitchstackEnsureResult> {
  const apiKey = partnerApiKey();
  if (!apiKey) {
    throw new Error("STITCHSTACK_PARTNER_API_KEY is not configured.");
  }

  const response = await fetch(`${STITCHSTACK_APP_URL}/api/partners/vendl/ensure-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const err = body as StitchstackEnsureError | null;
    const code = err?.error?.code ?? "provisioning_failed";
    const message = err?.error?.message ?? `Stitchstack ensure-account failed (${response.status}).`;
    const error = new Error(message) as Error & { code: string; status: number };
    error.code = code;
    error.status = response.status;
    throw error;
  }

  const result = body as (Omit<StitchstackEnsureResult, "pixel"> & {
    pixel?: StitchstackPixelPayload;
  }) | null;
  if (!result?.ok || typeof result.handoff_url !== "string" || !result.handoff_url.startsWith("http")) {
    throw new Error("Stitchstack ensure-account returned an invalid handoff URL.");
  }

  const pixel = parseStitchstackPixelPayload(result.pixel);
  return {
    ok: true,
    stitchstack_org_id: result.stitchstack_org_id,
    stitchstack_user_id: result.stitchstack_user_id,
    plan: result.plan,
    entitlements: Array.isArray(result.entitlements) ? result.entitlements : [],
    handoff_url: result.handoff_url,
    ...(pixel ? { pixel } : {}),
  };
}

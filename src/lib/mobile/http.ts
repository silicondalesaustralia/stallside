import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  MOBILE_MIN_APP_VERSION_HEADER,
  type MobileApiError,
} from "@/contracts/mobile/common";

/** Builds older than this are told to update (see the app's version gate). */
export const MOBILE_MIN_APP_VERSION =
  process.env.MOBILE_MIN_APP_VERSION?.trim() || "0.1.0";

export function mobileJson<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: {
      [MOBILE_MIN_APP_VERSION_HEADER]: MOBILE_MIN_APP_VERSION,
      "cache-control": "no-store",
    },
  });
}

export function mobileError(status: number, error: string): NextResponse<MobileApiError> {
  return mobileJson({ error }, status);
}

export function mobileServerError(label: string, error: unknown): NextResponse<MobileApiError> {
  console.error(label, error);
  return mobileError(500, "Something went wrong. Please try again.");
}

type Parsed<T> = { ok: true; data: T } | { ok: false; response: NextResponse<MobileApiError> };

export async function readMobileBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<Parsed<z.infer<S>>> {
  let json: unknown;
  try {
    const text = await request.text();
    json = text.trim() ? JSON.parse(text) : {};
  } catch {
    return { ok: false, response: mobileError(400, "Invalid request body.") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, response: mobileError(400, "Invalid request body.") };
  }
  return { ok: true, data: parsed.data };
}

export function readMobileQuery<S extends z.ZodType>(
  request: Request,
  schema: S,
): Parsed<z.infer<S>> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, response: mobileError(400, "Invalid request.") };
  }
  return { ok: true, data: parsed.data };
}

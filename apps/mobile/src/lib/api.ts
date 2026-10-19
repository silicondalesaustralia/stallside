import type { z } from "zod";
import {
  MOBILE_API_BASE,
  MOBILE_MIN_APP_VERSION_HEADER,
  mobileApiError,
} from "@contracts/mobile/common";
import { API_URL, APP_VERSION } from "@/lib/config";
import { isOlderVersion } from "@/lib/version";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const UPDATE_REQUIRED_STATUS = 426;

type ApiOptions<S extends z.ZodType> = {
  schema: S;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

async function readJson(res: Response): Promise<unknown> {
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Calls the Vendl mobile API and validates the response against the shared contract. */
export async function apiFetch<S extends z.ZodType>(
  path: string,
  { schema, method = "GET", body, token }: ApiOptions<S>,
): Promise<z.infer<S>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${MOBILE_API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach Vendl. Check your connection and try again.");
  }

  const minVersion = res.headers.get(MOBILE_MIN_APP_VERSION_HEADER);
  if (minVersion && isOlderVersion(APP_VERSION, minVersion)) {
    throw new ApiError(UPDATE_REQUIRED_STATUS, "Please update Vendl to keep using the app.");
  }

  const json = await readJson(res);
  if (!res.ok) {
    const parsedError = mobileApiError.safeParse(json);
    throw new ApiError(
      res.status,
      parsedError.success ? parsedError.data.error : "Something went wrong. Please try again.",
    );
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(res.status, "Vendl sent an unexpected response. Please update the app.");
  }
  return parsed.data;
}

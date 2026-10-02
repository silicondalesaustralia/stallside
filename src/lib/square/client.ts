import {
  SQUARE_API_VERSION,
  squareApiBaseUrl,
} from "@/lib/square/config";

export class SquareApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "SquareApiError";
  }
}

export async function squareFetch<T>(
  path: string,
  options: {
    accessToken: string;
    method?: string;
    body?: unknown;
    idempotencyKey?: string;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
    "Square-Version": SQUARE_API_VERSION,
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const res = await fetch(`${squareApiBaseUrl()}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errors =
      json && typeof json === "object" && "errors" in json
        ? (json as { errors?: { detail?: string }[] }).errors
        : undefined;
    const detail = errors?.[0]?.detail ?? `Square API ${res.status}`;
    throw new SquareApiError(detail, res.status, json);
  }

  return json as T;
}

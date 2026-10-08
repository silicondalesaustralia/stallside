/**
 * Client-safe JSON response reader.
 *
 * Platform errors (Vercel 413 "Request Entity Too Large", HTML 502 pages)
 * are plain text. Calling res.json() on those surfaces
 * `Unexpected token 'R', "Request En"...` to the user.
 */

export const GENERIC_API_ERROR = 'Something went wrong. Please try again.'

export function isJsonContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false
  const ct = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  return ct === 'application/json' || ct.endsWith('+json')
}

export function messageForHttpStatus(status: number): string {
  if (status === 413) return 'That file is too large. Try a screenshot under 4 MB.'
  if (status === 401 || status === 403) return 'Please sign in again and retry.'
  if (status === 429) return 'Too many requests. Please wait a moment and retry.'
  if (status >= 500) return GENERIC_API_ERROR
  return GENERIC_API_ERROR
}

/**
 * Parse a fetch Response as JSON.
 * Throws a friendly Error - never a raw JSON.parse / Unexpected-token message.
 */
export async function readApiJson<T = unknown>(res: Response): Promise<T> {
  if (!isJsonContentType(res.headers.get('content-type'))) {
    try {
      await res.text()
    } catch {
      // ignore
    }
    throw new Error(messageForHttpStatus(res.status))
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new Error(messageForHttpStatus(res.status))
  }
}

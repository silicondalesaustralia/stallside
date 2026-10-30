import { createHash, createHmac } from 'node:crypto'

/**
 * Cloudflare R2 (S3-compatible) presigned URLs via SigV4 query auth.
 * Source videos live here instead of Supabase Storage (Supabase plan caps uploads at 50 MB).
 */

type R2Method = 'GET' | 'PUT' | 'HEAD' | 'DELETE' | 'POST'

type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string }

function readR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucket = process.env.R2_VIDEO_SOURCES_BUCKET?.trim()
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('r2_not_configured')
  }
  return { accountId, accessKeyId, secretAccessKey, bucket }
}

export function isR2Configured(): boolean {
  try {
    readR2Config()
    return true
  } catch {
    return false
  }
}

function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

export type SigV4PresignInput = {
  method: R2Method
  host: string
  path: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  expiresSeconds: number
  now: Date
  /** Extra signed query params, e.g. `uploads`, `uploadId`, `partNumber`. */
  extraQuery?: Record<string, string>
}

export function signPresignedUrl(input: SigV4PresignInput): string {
  const { method, host, path, region } = input
  const amzDate = input.now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const dateStamp = amzDate.slice(0, 8)
  const scope = `${dateStamp}/${region}/s3/aws4_request`

  const query: Record<string, string> = {
    ...input.extraQuery,
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${input.accessKeyId}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(input.expiresSeconds),
    'X-Amz-SignedHeaders': 'host',
  }
  const canonicalQuery = Object.keys(query)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(query[k])}`)
    .join('&')

  const canonicalRequest = [method, path, canonicalQuery, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n')
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n')

  const signingKey = hmac(hmac(hmac(hmac(`AWS4${input.secretAccessKey}`, dateStamp), region), 's3'), 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  return `https://${host}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`
}

export function presignR2Url(
  method: R2Method,
  key: string,
  expiresSeconds: number,
  extraQuery?: Record<string, string>,
): string {
  const cfg = readR2Config()
  return signPresignedUrl({
    method,
    host: `${cfg.accountId}.r2.cloudflarestorage.com`,
    path: `/${rfc3986(cfg.bucket)}/${key.split('/').map(rfc3986).join('/')}`,
    region: 'auto',
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    expiresSeconds,
    now: new Date(),
    extraQuery,
  })
}

/** Returns object size in bytes, or null when the object does not exist. */
export async function headR2Object(key: string): Promise<number | null> {
  const res = await fetch(presignR2Url('HEAD', key, 60), { method: 'HEAD' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`r2_head_failed ${res.status}`)
  return Number(res.headers.get('content-length') ?? 0)
}

export async function deleteR2Object(key: string): Promise<void> {
  const res = await fetch(presignR2Url('DELETE', key, 60), { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`r2_delete_failed ${res.status}`)
}

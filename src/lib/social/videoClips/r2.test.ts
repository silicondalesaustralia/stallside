import assert from 'node:assert/strict'
import { signPresignedUrl } from './r2'
import { completeMultipartXml, multipartPartCount, parseListedParts, parseUploadId } from './r2Multipart'

// AWS SigV4 query-auth reference example ("Authenticating Requests: Using Query Parameters").
const url = signPresignedUrl({
  method: 'GET',
  host: 'examplebucket.s3.amazonaws.com',
  path: '/test.txt',
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  expiresSeconds: 86400,
  now: new Date('2013-05-24T00:00:00Z'),
})

assert.ok(
  url.endsWith('X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404'),
  `signature mismatch: ${url}`,
)
const partUrl = signPresignedUrl({
  method: 'PUT',
  host: 'acct.r2.cloudflarestorage.com',
  path: '/bucket/a.mov',
  region: 'auto',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'secret',
  expiresSeconds: 60,
  now: new Date('2026-01-01T00:00:00Z'),
  extraQuery: { partNumber: '3', uploadId: 'abc/def' },
})
assert.ok(
  partUrl.includes('X-Amz-SignedHeaders=host&partNumber=3&uploadId=abc%2Fdef&X-Amz-Signature='),
  `extra query not in canonical (byte) order: ${partUrl}`,
)

assert.equal(parseUploadId('<InitiateMultipartUploadResult><UploadId>u-1</UploadId></InitiateMultipartUploadResult>'), 'u-1')
const listed = parseListedParts(
  '<ListPartsResult><Part><PartNumber>2</PartNumber><ETag>&quot;b&quot;</ETag></Part>' +
    '<Part><PartNumber>1</PartNumber><ETag>&quot;a&quot;</ETag></Part></ListPartsResult>',
)
assert.deepEqual(listed.map((p) => p.partNumber), [1, 2])
assert.equal(
  completeMultipartXml(listed),
  '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>&quot;a&quot;</ETag></Part>' +
    '<Part><PartNumber>2</PartNumber><ETag>&quot;b&quot;</ETag></Part></CompleteMultipartUpload>',
)
assert.equal(multipartPartCount(260 * 1024 * 1024), 26)
assert.equal(multipartPartCount(1), 1)

console.log('r2 sigv4 test passed')

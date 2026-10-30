import assert from 'node:assert/strict'
import { clipMaxEdge, clipRateArgs, clipVideoKbps } from './clipSizeBudget'
import { FULL_VIDEO_MAX_DURATION_SECONDS } from './limits'

const LIMIT_BYTES = 50 * 1024 * 1024
const OVERSHOOT = 1.1
const projectedBytes = (seconds: number) => ((clipVideoKbps(seconds) + 128) * 1000 * seconds * OVERSHOOT) / 8

assert.equal(clipVideoKbps(30), 5000, 'short clips keep full quality')
assert.equal(clipMaxEdge(30), 1920)
assert.equal(clipMaxEdge(FULL_VIDEO_MAX_DURATION_SECONDS), 1280, 'long whole videos drop to 720p')
for (const s of [10, 60, 90, 142, FULL_VIDEO_MAX_DURATION_SECONDS, FULL_VIDEO_MAX_DURATION_SECONDS / 0.75]) {
  assert.ok(projectedBytes(s) < LIMIT_BYTES, `${s}s fits under 50 MB`)
}
assert.deepEqual(clipRateArgs(30), ['-maxrate', '5000k', '-bufsize', '10000k'])

console.log('clipSizeBudget tests passed')

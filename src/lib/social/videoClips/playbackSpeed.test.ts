import assert from 'node:assert/strict'
import { parseClipSpeed, scaleTimed } from './playbackSpeed'
import { buildEditFilterGraph } from './editFfmpegArgs'
import { parseCaptionsDoc } from './captionCues'

assert.equal(parseClipSpeed(1.5), 1.5)
assert.equal(parseClipSpeed('1.2'), 1.2)
assert.equal(parseClipSpeed(3), 1)
assert.equal(parseClipSpeed(undefined), 1)

assert.deepEqual(scaleTimed([{ s: 3, e: 6, text: 'a' }], 1.5), [{ s: 2, e: 4, text: 'a' }])
const same = [{ s: 1, e: 2 }]
assert.equal(scaleTimed(same, 1), same)

const segments = [{ s: 0, e: 4 }]
const normal = buildEditFilterGraph({ segments, hasAudio: true, assPath: null })
assert.equal(normal, buildEditFilterGraph({ segments, hasAudio: true, assPath: null, speed: 1 }), 'speed 1 graph unchanged')
assert.ok(!normal.includes('atempo'))

const fast = buildEditFilterGraph({ segments, hasAudio: true, assPath: null, speed: 1.5 })
assert.ok(fast.includes('concat=n=1:v=1:a=1[vcat][acat]'))
assert.ok(fast.includes('[vcat]setpts=PTS/1.5[vsped]'))
assert.ok(fast.includes('[acat]atempo=1.5[aout]'))
assert.ok(fast.endsWith('[vsped]null[vout]'))

const silent = buildEditFilterGraph({ segments, hasAudio: false, assPath: null, speed: 2 })
assert.ok(!silent.includes('atempo') && silent.includes('setpts=PTS/2'))

assert.equal(parseCaptionsDoc({}).speed, 1)
assert.equal(parseCaptionsDoc({ speed: 1.2 }).speed, 1.2)

console.log('playbackSpeed tests passed')

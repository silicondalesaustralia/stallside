import assert from 'node:assert/strict'
import {
  audioMutesFrom,
  audioPartsFrom,
  isAudioMutedAt,
  muteVolumeFilter,
  sanitizeAudioMutes,
  splitAudioAt,
  toggleAudioMuteAt,
} from './audioEdits'
import { parseCaptionsDoc } from './captionCues'
import { buildEditFilterGraph } from './editFfmpegArgs'

assert.deepEqual(sanitizeAudioMutes(undefined, 10), [])
assert.deepEqual(
  sanitizeAudioMutes([{ s: 4, e: 6 }, { s: 1, e: 2 }, { s: 5, e: 12 }, { s: 3, e: 3.05 }, { s: 'x', e: 1 }], 10),
  [{ s: 1, e: 2 }, { s: 4, e: 10 }],
)

const whole = audioPartsFrom([], 10)
assert.deepEqual(whole, [{ s: 0, e: 10, muted: false }])
assert.equal(splitAudioAt(whole, 0.1), null, 'too close to the edge')

const split = splitAudioAt(splitAudioAt(whole, 3) ?? [], 6) ?? []
assert.equal(split.length, 3)
const muted = toggleAudioMuteAt(split, 4) ?? []
assert.ok(isAudioMutedAt(muted, 4.5) && !isAudioMutedAt(muted, 7))
assert.deepEqual(audioMutesFrom(muted), [{ s: 3, e: 6 }])
assert.deepEqual(audioPartsFrom([{ s: 3, e: 6 }], 10), [
  { s: 0, e: 3, muted: false },
  { s: 3, e: 6, muted: true },
  { s: 6, e: 10, muted: false },
])
assert.deepEqual(audioMutesFrom(toggleAudioMuteAt(muted, 7) ?? []), [{ s: 3, e: 10 }], 'adjacent mutes merge')

assert.equal(muteVolumeFilter([]), '')
assert.equal(muteVolumeFilter([{ s: 1, e: 2 }]), "volume=0:enable='between(t,1.000,2.000)'")

const segments = [{ s: 0, e: 4 }, { s: 6, e: 10 }]
const plain = buildEditFilterGraph({ segments, hasAudio: true, assPath: null })
assert.equal(plain, buildEditFilterGraph({ segments, hasAudio: true, assPath: null, audioMutes: [] }))
const graph = buildEditFilterGraph({ segments, hasAudio: true, assPath: null, audioMutes: [{ s: 3, e: 7 }] })
assert.ok(graph.includes("[0:a]atrim=start=0.000:end=4.000,volume=0:enable='between(t,3.000,4.000)',asetpts=PTS-STARTPTS[a0]"))
assert.ok(graph.includes("[0:a]atrim=start=6.000:end=10.000,volume=0:enable='between(t,6.000,7.000)',asetpts=PTS-STARTPTS[a1]"))

assert.deepEqual(parseCaptionsDoc({}).audioMutes, [])
assert.deepEqual(parseCaptionsDoc({ cleanDuration: 5, audioMutes: [{ s: 1, e: 9 }] }).audioMutes, [{ s: 1, e: 5 }])

console.log('audioEdits tests passed')

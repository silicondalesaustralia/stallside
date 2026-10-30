import assert from 'node:assert/strict'
import { buildEditFilterGraph } from './editFfmpegArgs'
import { isFullClip, mapCaptionsToOutput, nextPlayableTime, normalizeSegments, outputDuration, toOutputTime } from './timeline'
import { addCueAt, deleteSegmentAt, dragCue, mergeCueWithNext, splitCueAt, splitSegmentsAt, trimSegmentsAt } from './timelineEdits'

assert.deepEqual(normalizeSegments('nope', 10), [{ s: 0, e: 10 }])
assert.deepEqual(normalizeSegments([{ s: 5, e: 20 }, { s: -1, e: 2 }, { s: 1.5, e: 3 }], 10), [
  { s: 0, e: 3 },
  { s: 5, e: 10 },
])
assert.deepEqual(normalizeSegments([{ s: 0, e: 0.1 }], 10), [{ s: 0, e: 10 }])
assert.ok(isFullClip([{ s: 0, e: 10 }], 10))

const segs = [{ s: 0, e: 2 }, { s: 5, e: 8 }]
assert.equal(outputDuration(segs), 5)
assert.equal(toOutputTime(6, segs), 3)
assert.equal(toOutputTime(3, segs), null)
assert.equal(nextPlayableTime(3, segs), 5)
assert.equal(nextPlayableTime(9, segs), null)

const mapped = mapCaptionsToOutput(
  [{ s: 1, e: 6, text: 'spans the cut' }, { s: 2.5, e: 4, text: 'gone' }],
  [{ w: 'a', s: 1, e: 1.5 }, { w: 'b', s: 3, e: 3.5 }, { w: 'c', s: 5.5, e: 6 }],
  segs,
)
assert.deepEqual(mapped.cues, [
  { s: 1, e: 2, text: 'spans the cut' },
  { s: 2, e: 3, text: 'spans the cut' },
])
assert.deepEqual(mapped.words.map((w) => [w.w, w.s, w.e]), [['a', 1, 1.5], ['c', 2.5, 3]])

const split = splitSegmentsAt([{ s: 0, e: 10 }], 4)
assert.deepEqual(split, [{ s: 0, e: 4 }, { s: 4, e: 10 }])
assert.deepEqual(normalizeSegments(split, 10), split)
assert.equal(splitSegmentsAt([{ s: 0, e: 10 }], 0.1), null)
assert.deepEqual(deleteSegmentAt(split ?? [], 2), [{ s: 4, e: 10 }])
assert.equal(deleteSegmentAt([{ s: 0, e: 10 }], 2), null)
assert.deepEqual(trimSegmentsAt(segs, 6, 'start'), [{ s: 6, e: 8 }])
assert.deepEqual(trimSegmentsAt(segs, 1, 'end'), [{ s: 0, e: 1 }])

const cues = [{ s: 0, e: 2, text: 'one two three four' }, { s: 3, e: 4, text: 'five' }]
assert.deepEqual(splitCueAt(cues, 0, 1)?.slice(0, 2), [
  { s: 0, e: 1, text: 'one two' },
  { s: 1, e: 2, text: 'three four' },
])
assert.equal(splitCueAt(cues, 1, 3.5), null)
assert.deepEqual(mergeCueWithNext(cues, 0), [{ s: 0, e: 4, text: 'one two three four five' }])
assert.deepEqual(addCueAt(cues, 2.2, 10)?.[1], { s: 2.2, e: 3, text: 'New caption' })
assert.equal(addCueAt(cues, 1, 10), null)
assert.deepEqual(dragCue(cues, 0, 'move', 5, 10)[0], { s: 1, e: 3, text: 'one two three four' })
assert.deepEqual(dragCue(cues, 1, 'end', 10, 10)[1], { s: 3, e: 10, text: 'five' })
assert.deepEqual(dragCue(cues, 1, 'start', -5, 10)[1], { s: 2, e: 4, text: 'five' })

assert.equal(
  buildEditFilterGraph({ segments: segs, hasAudio: true, assPath: '/tmp/x.ass' }),
  '[0:v]trim=start=0.000:end=2.000,setpts=PTS-STARTPTS[v0];[0:a]atrim=start=0.000:end=2.000,asetpts=PTS-STARTPTS[a0];' +
    '[0:v]trim=start=5.000:end=8.000,setpts=PTS-STARTPTS[v1];[0:a]atrim=start=5.000:end=8.000,asetpts=PTS-STARTPTS[a1];' +
    '[v0][a0][v1][a1]concat=n=2:v=1:a=1[vcat][aout];[vcat]ass=/tmp/x.ass[vout]',
)

console.log('timeline tests passed')

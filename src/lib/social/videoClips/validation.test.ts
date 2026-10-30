import assert from 'node:assert/strict'
import { VIDEO_SOURCE_ERRORS } from './limits'
import { clipJobDurationError, parseClipJobOptions, validateVideoSourceDuration } from './validation'

const full = parseClipJobOptions({ clipLength: 'full', clipCount: 6, captionStyle: 'none' })
assert.equal(full.clipLength, 'full')
assert.equal(full.clipCount, 1, 'whole video is always one clip')
assert.equal(full.captionStyle, 'none')
assert.equal(parseClipJobOptions({ clipLength: 'nope' }).clipLength, 'short')
assert.equal(parseClipJobOptions({ clipLength: 'medium', clipCount: 6 }).clipCount, 6)

assert.equal(clipJobDurationError('full', 8), null, 'short videos can be used whole')
assert.equal(clipJobDurationError('full', 180), null)
assert.equal(clipJobDurationError('full', 181), VIDEO_SOURCE_ERRORS.fullTooLong)
assert.equal(clipJobDurationError('short', 8), VIDEO_SOURCE_ERRORS.tooShort)
assert.equal(clipJobDurationError('medium', 600), null)
assert.equal(clipJobDurationError('full', null), null)

assert.deepEqual(validateVideoSourceDuration(2), { ok: false, error: VIDEO_SOURCE_ERRORS.tooShortUpload })
assert.deepEqual(validateVideoSourceDuration(8), { ok: true, durationSeconds: 8 })

console.log('validation tests passed')

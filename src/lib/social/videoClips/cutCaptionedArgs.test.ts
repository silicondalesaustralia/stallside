import assert from 'node:assert/strict'
import { clipOutputSize, cutClipWithCaptionsArgs } from './cutCaptionedArgs'

assert.deepEqual(clipOutputSize('vertical', 3840, 2160), { width: 1080, height: 1920 })
assert.deepEqual(clipOutputSize('vertical', 1920, 1080), { width: 608, height: 1080 })
assert.deepEqual(clipOutputSize('vertical', 2160, 3840), { width: 1080, height: 1920 })
assert.deepEqual(clipOutputSize('vertical', 1080, 1920), { width: 1080, height: 1920 })
assert.deepEqual(clipOutputSize('original', 3840, 2160), { width: 1920, height: 1080 })
assert.deepEqual(clipOutputSize('original', 1080, 1920), { width: 1080, height: 1920 })

const args = cutClipWithCaptionsArgs({
  inputPath: '/w/source.mov',
  cleanPath: '/w/a.mp4',
  captionedPath: '/w/a-captioned.mp4',
  start: 12.5,
  end: 30,
  aspect: 'vertical',
  hasAudio: true,
  assPath: '/w/a.ass',
  fontsDir: '/app/lib/social/fonts',
})
const tIndex = args.indexOf('-t')
assert.ok(tIndex > -1 && tIndex < args.indexOf('-i'), '-t must be an input option so both outputs are trimmed')
assert.equal(args[tIndex + 1], '17.500')
const graph = args[args.indexOf('-filter_complex') + 1]
assert.ok(graph.includes('split=2[clean][cap]'))
assert.ok(graph.includes('[cap]ass=/w/a.ass:fontsdir=/app/lib/social/fonts[captioned]'))
assert.equal(args.filter((a) => a === '0:a:0').length, 2, 'audio mapped into both outputs')
assert.ok(args.indexOf('/w/a.mp4') < args.indexOf('[captioned]'), 'clean output first')
assert.equal(args[args.length - 1], '/w/a-captioned.mp4')

console.log('cutCaptionedArgs tests passed')

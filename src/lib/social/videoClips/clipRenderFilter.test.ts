import assert from 'node:assert/strict'
import { mapBlurRegionsToOutput } from '@/lib/social/videoBranding/blurRegions'
import { buildClipRenderFilterGraph } from './clipRenderFilter'

const region = {
  id: 'b1',
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.25,
  start: 2,
  end: 8,
}

async function main() {
  const mapped = mapBlurRegionsToOutput([region], [{ s: 0, e: 10 }], 2)
  assert.equal(mapped.length, 1)
  assert.equal(mapped[0].start, 1)
  assert.equal(mapped[0].end, 4)

  const cutAway = mapBlurRegionsToOutput([region], [{ s: 0, e: 1 }], 1)
  assert.equal(cutAway.length, 0)

  const graph = buildClipRenderFilterGraph({
    edited: false,
    segments: [{ s: 0, e: 10 }],
    hasAudio: true,
    assPath: null,
    blurRegions: [region],
    frameWidth: 1080,
    frameHeight: 1920,
  })
  assert.match(graph.filterComplex, /boxblur/)
  assert.equal(graph.audioLabel, null)
  assert.ok(graph.videoLabel.startsWith('v_blur_'))

  const edited = buildClipRenderFilterGraph({
    edited: true,
    segments: [{ s: 0, e: 5 }],
    hasAudio: true,
    assPath: '/tmp/x.ass',
    fontsDir: '/tmp/fonts',
    speed: 1,
    audioMutes: [],
    blurRegions: [region],
    frameWidth: 1080,
    frameHeight: 1920,
  })
  assert.match(edited.filterComplex, /trim=start=0.000/)
  assert.match(edited.filterComplex, /boxblur/)
  assert.match(edited.filterComplex, /ass=\/tmp\/x\.ass/)
  assert.equal(edited.audioLabel, 'aout')
  assert.equal(edited.videoLabel, 'v_ass')

  console.log('clipRenderFilter tests passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MUSIC_TRACKS, findMusicTrack, formatTrackLength, parseMusicChoice, searchMusic } from './musicCatalog'
import { musicFilter, musicMixArgs } from './musicMixArgs'
import { MUSIC_CATEGORIES } from './musicTypes'

const first = MUSIC_TRACKS[0]

test('catalogue has tracks in every category with unique ids', () => {
  assert.ok(MUSIC_TRACKS.length > 100)
  assert.equal(new Set(MUSIC_TRACKS.map((t) => t.id)).size, MUSIC_TRACKS.length)
  for (const c of MUSIC_CATEGORIES) assert.ok(MUSIC_TRACKS.some((t) => t.category === c), c)
})

test('search filters by category and matches every word, popular first', () => {
  const calm = searchMusic({ category: 'calm', query: '' })
  assert.ok(calm.length > 0 && calm.every((t) => t.category === 'calm'))
  assert.ok(calm.every((t, i) => i === 0 || calm[i - 1].rank <= t.rank))
  const byTitle = searchMusic({ category: 'all', query: first.title.toUpperCase() })
  assert.ok(byTitle.some((t) => t.id === first.id))
  assert.equal(searchMusic({ category: 'all', query: 'zzqx-no-such-song' }).length, 0)
})

test('music choice keeps known tracks and clamps volumes', () => {
  assert.deepEqual(parseMusicChoice({ trackId: first.id, volume: 3, originalVolume: -1 }), {
    trackId: first.id,
    volume: 1,
    originalVolume: 0,
  })
  assert.equal(parseMusicChoice({ trackId: 'not-a-track', volume: 0.5 }), null)
  assert.equal(parseMusicChoice(null), null)
  assert.equal(findMusicTrack(first.id)?.title, first.title)
  assert.equal(formatTrackLength(125.4), '2:05')
})

test('mix keeps the video stream and fades the music to the video length', () => {
  const args = musicMixArgs({
    videoPath: 'in.mp4',
    musicPath: 'song.mp3',
    outputPath: 'out.mp4',
    durationSeconds: 12,
    hasAudio: true,
    music: { volume: 0.4, originalVolume: 0.8 },
  })
  const graph = args[args.indexOf('-filter_complex') + 1]
  assert.match(graph, /\[0:a\]volume=0\.80\[o\]/)
  assert.match(graph, /amix=inputs=2/)
  assert.equal(args[args.indexOf('-c:v') + 1], 'copy')
  assert.equal(args[args.indexOf('-t') + 1], '12.000')
  assert.match(musicFilter(12, 0.4), /afade=t=out:st=10\.000:d=2\.00/)
})

test('silent videos and muted originals get music only', () => {
  for (const [hasAudio, originalVolume] of [[false, 1], [true, 0]] as const) {
    const args = musicMixArgs({ videoPath: 'a', musicPath: 'b', outputPath: 'c', durationSeconds: 5, hasAudio, music: { volume: 0.9, originalVolume } })
    const graph = args[args.indexOf('-filter_complex') + 1]
    assert.doesNotMatch(graph, /\[0:a\]/)
    assert.match(graph, /volume=0\.90/)
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import type { SocialWorkspacePost } from '@/lib/social/useSocialWorkspace'
import { isQueuedPost, matchesFilter, overallStatus } from './derivePostOutcome'

const NOW = Date.parse('2026-11-13T01:00:00Z')

function post(fields: Partial<SocialWorkspacePost>): SocialWorkspacePost {
  return {
    id: 'p1',
    status: 'scheduled',
    publishing_mode: 'automatic',
    platforms: ['facebook'],
    scheduled_for: null,
    created_at: '2026-11-13T00:00:00Z',
    ...fields,
  } as SocialWorkspacePost
}

test('publishing posts and due automatic posts are in the queue', () => {
  assert.equal(isQueuedPost(post({ status: 'publishing' }), NOW), true)
  assert.equal(isQueuedPost(post({ scheduled_for: '2026-11-13T00:59:00Z' }), NOW), true)
  assert.equal(isQueuedPost(post({ scheduled_for: '2026-11-13T02:00:00Z' }), NOW), false)
  assert.equal(isQueuedPost(post({ scheduled_for: '2026-11-13T00:59:00Z', publishing_mode: 'manual' }), NOW), false)
})

test('queued posts show as In queue under the Scheduled filter', () => {
  const queued = post({ status: 'publishing' })
  assert.equal(overallStatus(queued), 'queued')
  assert.equal(matchesFilter(queued, 'scheduled'), true)
  assert.equal(matchesFilter(queued, 'posted'), false)
})

import assert from 'node:assert/strict'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  creditCurrency,
  findSocialCreditPack,
  formatPackPrice,
  socialCreditPackName,
  socialCreditPeriodKey,
} from './packs'
import { loadSocialCreditSummary } from './ledger'
import { socialAccessFromSummary } from './socialAccess'
import { clipJobCreditActionId, refundUnmadeClips } from './clipJobCredits'

type RpcCall = { fn: string; args: Record<string, unknown> }

function fakeDb(data: unknown, calls: RpcCall[] = []): SupabaseClient {
  const db = {
    rpc: async (fn: string, args: Record<string, unknown>) => {
      calls.push({ fn, args })
      return { data, error: null }
    },
  }
  return db as unknown as SupabaseClient
}

async function main() {
  const clip15 = findSocialCreditPack('clip_15')
  assert.ok(clip15)
  assert.equal(formatPackPrice(clip15, 'AUD'), 'A$19')
  assert.equal(formatPackPrice(clip15, 'USD'), 'US$14')
  assert.equal(formatPackPrice(clip15, 'GBP'), '£11')
  assert.equal(formatPackPrice(clip15, 'EUR'), '€14')
  assert.equal(findSocialCreditPack('nope'), null)
  assert.equal(socialCreditPackName(clip15), '15 clips')
  assert.equal(creditCurrency('usd'), 'USD')
  assert.equal(creditCurrency('NZD'), 'AUD')
  assert.equal(creditCurrency(null), 'AUD')

  // Adelaide is UTC+10:30 in November: 31 Oct 14:00 UTC is already 1 Nov there.
  assert.equal(socialCreditPeriodKey(new Date('2026-10-31T14:00:00Z')), '2026-11')
  assert.equal(socialCreditPeriodKey(new Date('2026-10-31T13:00:00Z')), '2026-10')

  const rows = [
    { kind: 'design', purchased: '12', allowance_used: 2 },
    { kind: 'clip', purchased: 0, allowance_used: 9 },
  ]
  const pro = await loadSocialCreditSummary(fakeDb(rows), 'o1', true)
  assert.deepEqual(pro.design, { allowance: 5, allowanceLeft: 3, purchased: 12, available: 15 })
  assert.deepEqual(pro.clip, { allowance: 5, allowanceLeft: 0, purchased: 0, available: 0 })

  const free = await loadSocialCreditSummary(fakeDb([]), 'o2', false)
  assert.equal(free.design.available, 0)
  assert.equal(socialAccessFromSummary(false, free), false)
  assert.equal(socialAccessFromSummary(true, free), true)
  assert.equal(socialAccessFromSummary(false, pro), true)

  const calls: RpcCall[] = []
  await refundUnmadeClips(fakeDb(2, calls), { id: 'j1', clip_count: 5, clips_created: 3 })
  assert.deepEqual(calls, [
    { fn: 'social_credit_refund', args: { p_kind: 'clip', p_action_id: clipJobCreditActionId('j1'), p_count: 2 } },
  ])
  await refundUnmadeClips(fakeDb(0, calls), { id: 'j2', clip_count: 3, clips_created: 3 })
  assert.equal(calls.length, 1)

  console.log('socialCredits tests passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
